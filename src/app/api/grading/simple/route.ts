import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SimpleGrade from '@/models/SimpleGrade';
import Student from '@/models/Student';
import CourseAssignment from '@/models/CourseAssignment';
import mongoose from 'mongoose';

// GET /api/grading/simple?assignmentId=xxx&section=A&teacherId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const section = searchParams.get('section') as 'A' | 'B' | 'C';
    const teacherId = searchParams.get('teacherId');

    console.log('Grading API called with:', { assignmentId, section, teacherId });

    if (!assignmentId || !section || !teacherId) {
      return NextResponse.json(
        { error: 'Assignment ID, section, and teacher ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the course assignment
    console.log('Looking for assignment with ID:', assignmentId);
    const assignment = await CourseAssignment.findById(assignmentId);
    console.log('Found assignment:', assignment);
    
    if (!assignment) {
      // Try to find any assignment for this teacher to help debug
      const teacherAssignments = await CourseAssignment.find({ teacherId }).limit(5);
      console.log('Teacher has these assignments:', teacherAssignments);
      
      return NextResponse.json(
        { 
          error: 'Assignment not found',
          debug: {
            searchedId: assignmentId,
            teacherId: teacherId,
            teacherAssignments: teacherAssignments.map(a => ({
              id: a._id,
              courseId: a.courseId,
              year: a.year,
              semester: a.semester
            }))
          }
        },
        { status: 404 }
      );
    }
    
    if (assignment.teacherId.toString() !== teacherId) {
      return NextResponse.json(
        { error: 'Access denied - not your assignment' },
        { status: 403 }
      );
    }

    // Get course details from allcourses collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const coursesCollection = db.collection('allcourses');
    let course = null;
    
    console.log('Looking for course with ID:', assignment.courseId);
    
    try {
      if (mongoose.Types.ObjectId.isValid(assignment.courseId.toString())) {
        course = await coursesCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(assignment.courseId.toString()) 
        });
      }
      
      if (!course) {
        course = await coursesCollection.findOne({ _id: assignment.courseId });
      }
      
      console.log('Found course:', course);
    } catch (err) {
      console.error('Error finding course:', err);
    }

    if (!course) {
      // If course not found in allcourses, create a fallback
      console.log('Course not found in allcourses, creating fallback');
      course = {
        _id: assignment.courseId,
        courseCode: `COURSE-${assignment.courseId}`,
        courseName: 'Course Name Not Found'
      };
    }

    // Get students enrolled in this course for the specific year and section
    console.log('Looking for students with:', {
      year: assignment.year,
      section: section,
      courseCode: course.courseCode
    });

    const students = await Student.find({
      year: assignment.year,
      section: section,
      isActive: true,
      coursesEnrolled: { $in: [course.courseCode] }
    }).sort({ rollNumber: 1 });

    console.log('Found students with course enrollment:', students.length);

    // If no students found with course enrollment, get all students from that year/section
    let studentsToReturn = students;
    if (students.length === 0) {
      console.log('No students found with course enrollment, getting all students from year/section');
      studentsToReturn = await Student.find({
        year: assignment.year,
        section: section,
        isActive: true
      }).sort({ rollNumber: 1 });
      console.log('Found students without course filter:', studentsToReturn.length);
    }

    // Get existing grades for these students
    const studentIds = studentsToReturn.map(s => s._id);
    const grades = await SimpleGrade.find({
      studentId: { $in: studentIds },
      courseCode: course.courseCode,
      year: assignment.year,
      semester: assignment.semester
    });

    console.log('Found existing grades:', grades.length);

    const gradesMap = new Map(
      grades.map(grade => [grade.studentId.toString(), grade])
    );

    // Combine student data with grades
    const studentsWithGrades = studentsToReturn.map(student => ({
      ...student.toObject(),
      grade: gradesMap.get(student._id.toString()) || null
    }));

    console.log('Returning data for:', studentsWithGrades.length, 'students');

    return NextResponse.json({
      success: true,
      students: studentsWithGrades,
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        year: assignment.year,
        semester: assignment.semester
      },
      assignment: assignment,
      section: section
    });

  } catch (error) {
    console.error('Error fetching students for grading:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students: ' + error.message },
      { status: 500 }
    );
  }
}

// POST /api/grading/simple - Save simple grades
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { grades, teacherId, assignmentId } = await request.json();
    
    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: 'Grades array is required' },
        { status: 400 }
      );
    }

    if (!teacherId || !assignmentId) {
      return NextResponse.json(
        { error: 'Teacher ID and assignment ID are required' },
        { status: 400 }
      );
    }

    // Get the course assignment
    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment || assignment.teacherId.toString() !== teacherId) {
      return NextResponse.json(
        { error: 'Assignment not found or access denied' },
        { status: 404 }
      );
    }

    // Get course details
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const coursesCollection = db.collection('allcourses');
    let course = null;
    
    try {
      if (mongoose.Types.ObjectId.isValid(assignment.courseId.toString())) {
        course = await coursesCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(assignment.courseId.toString()) 
        });
      }
      
      if (!course) {
        course = await coursesCollection.findOne({ _id: assignment.courseId });
      }
    } catch (err) {
      console.error('Error finding course:', err);
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course details not found' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    for (const gradeData of grades) {
      try {
        const { studentId, sessionalMarks, section, comments } = gradeData;
        
        if (!studentId || sessionalMarks === undefined) {
          errors.push('Missing student ID or marks');
          continue;
        }

        // Validate marks (0-40)
        if (sessionalMarks < 0 || sessionalMarks > 40) {
          errors.push(`Invalid marks for student ${studentId}: ${sessionalMarks}`);
          continue;
        }

        // Update or create grade
        const grade = await SimpleGrade.findOneAndUpdate(
          {
            studentId,
            courseCode: course.courseCode,
            year: assignment.year,
            semester: assignment.semester
          },
          {
            studentId,
            teacherId,
            courseCode: course.courseCode,
            courseName: course.courseName,
            year: assignment.year,
            semester: assignment.semester,
            section,
            sessionalMarks: parseFloat(sessionalMarks),
            totalMarks: 40,
            comments: comments?.trim(),
            gradedAt: new Date()
          },
          {
            upsert: true,
            new: true
          }
        );

        results.push({ studentId, action: 'saved', grade });

      } catch (error: any) {
        errors.push(`Error processing grade for student ${gradeData.studentId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      saved: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error saving grades:', error);
    return NextResponse.json(
      { error: 'Failed to save grades' },
      { status: 500 }
    );
  }
}