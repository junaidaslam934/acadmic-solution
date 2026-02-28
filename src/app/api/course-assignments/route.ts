import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Teacher from '@/models/Teacher';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    const filter: any = {};
    if (teacherId) filter.teacherId = teacherId;
    
    const assignments = await CourseAssignment.find(filter).sort({ year: 1, semester: 1 }).lean();
    
    const db = mongoose.connection.db;
    if (db) {
      const coursesCollection = db.collection('allcourses');
      
      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        if (assignment.courseId) {
          try {
            const courseId = assignment.courseId;
            let course = null;
            
            // Try as ObjectId first
            if (mongoose.Types.ObjectId.isValid(courseId.toString())) {
              course = await coursesCollection.findOne({ 
                _id: new mongoose.Types.ObjectId(courseId.toString()) 
              });
            }
            
            // If not found, try as string
            if (!course) {
              course = await coursesCollection.findOne({ _id: courseId });
            }
            
            if (course) {
              assignments[i].courseId = {
                _id: course._id,
                courseCode: course.courseCode || 'N/A',
                courseName: course.courseName || 'N/A',
                credits: course.credits || 0,
              };
            } else {
              // If course not found, set default values
              assignments[i].courseId = {
                _id: courseId,
                courseCode: 'N/A',
                courseName: 'N/A',
                credits: 0,
              };
            }
          } catch (err) {
            console.error('Error populating course:', err);
            assignments[i].courseId = {
              _id: assignment.courseId,
              courseCode: 'N/A',
              courseName: 'N/A',
              credits: 0,
            };
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, assignments });
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
    const { teacherId, courseId, year, semester, isPreferred } = body;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const coursesCollection = db.collection('allcourses');
    let course;
    
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      course = await coursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
    }
    
    if (!course) {
      course = await coursesCollection.findOne({ _id: courseId });
    }
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    const updateData: any = { 
      teacherId, 
      courseId, 
      year, 
      semester, 
      isPreferred: isPreferred || false
    };
    
    const assignment = await CourseAssignment.findOneAndUpdate(
      { teacherId, courseId, year, semester },
      updateData,
      { upsert: true, new: true }
    );
    
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
    
    await CourseAssignment.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
