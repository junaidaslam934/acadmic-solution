import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SessionalMarks from '@/models/SessionalMarks';
import Student from '@/models/Student';
import CourseAssignment from '@/models/CourseAssignment';
import mongoose from 'mongoose';

// GET /api/grading/sessional?courseId=xxx&section=A&teacherId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const section = searchParams.get('section') as 'A' | 'B' | 'C';
    const teacherId = searchParams.get('teacherId');

    if (!courseId || !section || !teacherId) {
      return NextResponse.json(
        { error: 'Course ID, section, and teacher ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify teacher has access to this course
    const assignment = await CourseAssignment.findOne({
      teacherId: teacherId,
      courseId: courseId
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Get course details from allcourses collection
    const db = mongoose.connection.db!;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const coursesCollection = db.collection('allcourses');
    let course = null;
    
    try {
      if (mongoose.Types.ObjectId.isValid(courseId)) {
        course = await coursesCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(courseId) 
        });
      }
      
      if (!course) {
        course = await coursesCollection.findOne({ _id: courseId as any });
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

    // Get students enrolled in this course for the specific year and section
    const students = await Student.find({
      year: assignment.year,
      section: section,
      isActive: true,
      coursesEnrolled: { $in: [course.courseCode] }
    }).sort({ rollNumber: 1 });

    // If no students found with course enrollment, get all students from that year/section
    let studentsToReturn = students;
    if (students.length === 0) {
      studentsToReturn = await Student.find({
        year: assignment.year,
        section: section,
        isActive: true
      }).sort({ rollNumber: 1 });
    }

    // Get existing sessional marks for these students
    const studentIds = studentsToReturn.map(s => s._id);
    const sessionalMarks = await SessionalMarks.find({
      studentId: { $in: studentIds },
      courseId: courseId,
      year: assignment.year,
      semester: assignment.semester
    });

    const marksMap = new Map(
      sessionalMarks.map(mark => [mark.studentId.toString(), mark])
    );

    // Combine student data with sessional marks
    const studentsWithMarks = studentsToReturn.map(student => ({
      ...student.toObject(),
      sessionalMarks: marksMap.get(student._id.toString()) || null
    }));

    return NextResponse.json({
      success: true,
      students: studentsWithMarks,
      course: {
        _id: course._id,
        courseCode: course.courseCode,
        courseName: course.courseName,
        year: assignment.year,
        semester: assignment.semester
      },
      section: section
    });

  } catch (error: any) {
    console.error('Error fetching sessional marks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students and marks' },
      { status: 500 }
    );
  }
}

// POST /api/grading/sessional - Save sessional marks
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { marks, teacherId, year, semester, section } = await request.json();
    
    if (!Array.isArray(marks) || marks.length === 0) {
      return NextResponse.json(
        { error: 'Marks array is required' },
        { status: 400 }
      );
    }

    if (!teacherId || !year || !semester || !section) {
      return NextResponse.json(
        { error: 'Teacher ID, year, semester, and section are required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const markData of marks) {
      try {
        const { studentId, courseId, quizMarks, assignmentMarks, midMarks, comments } = markData;
        
        if (!studentId || !courseId) {
          errors.push('Missing student ID or course ID');
          continue;
        }

        // Verify teacher has access to this course
        const assignment = await CourseAssignment.findOne({
          teacherId: teacherId,
          courseId: courseId
        });

        if (!assignment) {
          errors.push(`Access denied for course ${courseId}`);
          continue;
        }

        // Update or create sessional marks
        const sessionalMark = await SessionalMarks.findOneAndUpdate(
          {
            studentId,
            courseId,
            year,
            semester
          },
          {
            studentId,
            courseId,
            teacherId,
            year,
            semester,
            section,
            quizMarks: quizMarks || 0,
            quizTotal: 10,
            assignmentMarks: assignmentMarks || 0,
            assignmentTotal: 10,
            midMarks: midMarks || 0,
            midTotal: 20,
            lastUpdatedBy: teacherId,
            comments: comments?.trim()
          },
          {
            upsert: true,
            new: true
          }
        );

        results.push({ studentId, action: 'saved', marks: sessionalMark });

      } catch (error: any) {
        errors.push(`Error processing marks for student ${markData.studentId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      saved: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error saving sessional marks:', error);
    return NextResponse.json(
      { error: 'Failed to save marks' },
      { status: 500 }
    );
  }
}