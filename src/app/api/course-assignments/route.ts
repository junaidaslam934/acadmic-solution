import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    
    let query: any = { 
      $or: [
        { isActive: true },
        { isActive: { $exists: false } } // Handle old records without isActive field
      ]
    };
    if (teacherId) {
      // Try multiple formats to match the teacherId
      query.$and = [
        query,
        {
          $or: [
            { teacherId: teacherId },
            { teacherId: new mongoose.Types.ObjectId(teacherId) }
          ]
        }
      ];
      // Simplify the query structure
      query = {
        $and: [
          {
            $or: [
              { isActive: true },
              { isActive: { $exists: false } }
            ]
          },
          {
            $or: [
              { teacherId: teacherId },
              { teacherId: new mongoose.Types.ObjectId(teacherId) }
            ]
          }
        ]
      };
    }
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    
    console.log('Course assignments query:', { teacherId, query });
    
    // First try to get assignments without populate to see raw data
    const rawAssignments = await CourseAssignment.find(query).sort({ year: 1, semester: 1 });
    console.log('Raw assignments found:', rawAssignments.length);
    console.log('Sample raw assignment:', rawAssignments[0]);
    
    // If no results with Mongoose, try direct database query
    if (rawAssignments.length === 0 && teacherId) {
      const db = mongoose.connection.db;
      const collection = db.collection('courseasigned');
      const directResults = await collection.find({ 
        teacherId: teacherId,
        isActive: true 
      }).toArray();
      console.log('Direct database query results:', directResults.length);
      
      if (directResults.length > 0) {
        console.log('Found assignments via direct query, but not via Mongoose model');
        console.log('Sample direct result:', directResults[0]);
      }
    }
    
    const assignments = await CourseAssignment.find(query)
      .populate('teacherId', 'name email employeeId specialization')
      .populate('courseId', 'courseCode courseName totalCreditHours department')
      .sort({ year: 1, semester: 1 });

    console.log('Populated assignments found:', assignments.length);

    // For backward compatibility, if no specific teacherId is requested, 
    // return grouped assignments (new format)
    if (!teacherId) {
      const courseGroups = assignments.reduce((acc: any, assignment: any) => {
        const courseKey = `${assignment.courseId._id}_${assignment.year}_${assignment.semester}`;
        
        if (!acc[courseKey]) {
          acc[courseKey] = {
            course: assignment.courseId,
            year: assignment.year,
            semester: assignment.semester,
            teachers: [],
            totalAssignedHours: 0,
          };
        }
        
        acc[courseKey].teachers.push({
          teacher: assignment.teacherId,
          creditHours: assignment.creditHours,
          teachingRole: assignment.teachingRole,
          responsibilities: assignment.responsibilities,
          isPreferred: assignment.isPreferred,
          assignmentId: assignment._id,
        });
        
        acc[courseKey].totalAssignedHours += assignment.creditHours;
        
        return acc;
      }, {});

      return NextResponse.json({
        success: true,
        assignments: Object.values(courseGroups),
      });
    }

    // For teacher-specific requests, return individual assignments (old format for compatibility)
    const formattedAssignments = await Promise.all(assignments.map(async assignment => {
      let courseData = assignment.courseId;
      
      // If courseId didn't populate properly or is just an ObjectId, fetch from allcourses collection
      if (!courseData || typeof courseData === 'string' || !courseData.courseCode) {
        try {
          const db = mongoose.connection.db;
          if (db && assignment.courseId) {
            const coursesCollection = db.collection('allcourses');
            const courseId = assignment.courseId._id || assignment.courseId;
            
            console.log('Fetching course from allcourses:', courseId);
            
            if (courseId && mongoose.Types.ObjectId.isValid(courseId.toString())) {
              courseData = await coursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId.toString()) });
            }
            
            if (!courseData && courseId) {
              courseData = await coursesCollection.findOne({ _id: courseId.toString() });
            }
            
            console.log('Found course data:', courseData ? 'Yes' : 'No');
            if (courseData) {
              console.log('Course details:', {
                code: courseData.courseCode || courseData.code,
                name: courseData.courseName || courseData.name,
                credits: courseData.totalCreditHours || courseData.credits
              });
            }
          }
        } catch (error) {
          console.error('Error fetching course from allcourses:', error);
        }
      }
      
      // Safely extract course ID
      const courseId = courseData?._id || 
                      (assignment.courseId && assignment.courseId._id) || 
                      assignment.courseId || 
                      'unknown';
      
      return {
        _id: assignment._id,
        teacherId: (assignment.teacherId && assignment.teacherId._id) || assignment.teacherId,
        courseId: {
          _id: courseId,
          courseCode: courseData?.courseCode || courseData?.code || courseData?.CourseCode || 'Unknown',
          courseName: courseData?.courseName || courseData?.name || courseData?.CourseName || 'Unknown Course',
          credits: courseData?.totalCreditHours || courseData?.credits || courseData?.creditHours || courseData?.Credits || 3,
        },
        year: assignment.year,
        semester: assignment.semester,
        isPreferred: assignment.isPreferred || false,
        // Include new fields for enhanced functionality
        creditHours: assignment.creditHours || 3,
        teachingRole: assignment.teachingRole || 'primary',
        responsibilities: assignment.responsibilities || [],
      };
    }));
    
    return NextResponse.json({ success: true, assignments: formattedAssignments });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      teacherId, 
      courseId, 
      year, 
      semester, 
      isPreferred,
      creditHours,
      teachingRole,
      responsibilities 
    } = body;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }
    
    // Try to find course in new Course model first
    let course = await Course.findById(courseId);
    
    // If not found, try the old allcourses collection for backward compatibility
    if (!course) {
      const db = mongoose.connection.db;
      if (db) {
        const coursesCollection = db.collection('allcourses');
        
        if (mongoose.Types.ObjectId.isValid(courseId)) {
          course = await coursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
        }
        
        if (!course) {
          course = await coursesCollection.findOne({ _id: courseId });
        }
      }
    }
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // For backward compatibility, if creditHours not provided, use course total credit hours
    const assignedCreditHours = creditHours || course.totalCreditHours || course.credits || 3;
    const assignedTeachingRole = teachingRole || 'primary';
    const assignedResponsibilities = responsibilities || [];

    // Check if this exact assignment already exists
    const existingAssignment = await CourseAssignment.findOne({
      teacherId,
      courseId,
      year,
      semester,
      teachingRole: assignedTeachingRole,
      isActive: true
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Teacher already assigned to this course with this role' },
        { status: 400 }
      );
    }

    // Check total assigned hours don't exceed course limit
    const existingAssignments = await CourseAssignment.find({
      courseId,
      year,
      semester,
      isActive: true
    });

    const totalAssigned = existingAssignments.reduce(
      (sum, assignment) => sum + assignment.creditHours, 
      0
    );

    const courseTotalHours = course.totalCreditHours || course.credits || 3;
    if (totalAssigned + assignedCreditHours > courseTotalHours) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot assign ${assignedCreditHours} hours. Course has ${courseTotalHours} total hours, ${totalAssigned} already assigned.`
        },
        { status: 400 }
      );
    }
    
    const assignment = new CourseAssignment({
      teacherId, 
      courseId, 
      year, 
      semester, 
      isPreferred: isPreferred || false,
      creditHours: assignedCreditHours,
      teachingRole: assignedTeachingRole,
      responsibilities: assignedResponsibilities,
      isActive: true
    });

    await assignment.save();
    
    // Update teacher's class advisor field for backward compatibility
    await Teacher.findByIdAndUpdate(
      teacherId,
      { classAdvisor: year.toString() },
      { new: true }
    );

    // Send webhook to n8n for email notification
    const webhookData = {
      teacherId: teacher._id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      courseCode: course.courseCode,
      courseName: course.courseName,
      year: year,
      semester: semester,
      isPreferred: isPreferred || false,
      creditHours: assignedCreditHours,
      teachingRole: assignedTeachingRole,
      assignedAt: new Date().toISOString(),
    };

    // Send to n8n webhook asynchronously (non-blocking)
    (async () => {
      try {
        const webhookUrl = 'https://junniauto.app.n8n.cloud/webhook-test/course-assignment';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!webhookResponse.ok) {
          console.warn('n8n webhook request failed:', webhookResponse.status, webhookResponse.statusText);
        } else {
          console.log('n8n webhook called successfully for course assignment');
        }
      } catch (webhookError) {
        console.error('Error calling n8n webhook:', webhookError);
        // Don't fail the assignment if webhook fails
      }
    })();
    
    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Assignment ID required' },
        { status: 400 }
      );
    }
    
    // Soft delete by setting isActive to false instead of hard delete
    const assignment = await CourseAssignment.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}