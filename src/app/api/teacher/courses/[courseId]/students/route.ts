import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Student from '@/models/Student';
import Grade from '@/models/Grade';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') as 'A' | 'B' | 'C';
    const assessmentId = searchParams.get('assessmentId');
    const teacherId = searchParams.get('teacherId');

    if (!section || !teacherId) {
      return NextResponse.json(
        { error: 'Section and Teacher ID parameters are required' },
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
    // Students are enrolled based on year and their coursesEnrolled array should contain the course code
    const students = await Student.find({
      year: assignment.year,
      section: section,
      isActive: true,
      coursesEnrolled: { $in: [course.courseCode] } // Check if course code is in enrolled courses
    }).sort({ rollNumber: 1 });

    // If no students found with course enrollment, get all students from that year/section
    // (fallback for cases where coursesEnrolled might not be properly set)
    let studentsToReturn = students;
    if (students.length === 0) {
      studentsToReturn = await Student.find({
        year: assignment.year,
        section: section,
        isActive: true
      }).sort({ rollNumber: 1 });
    }

    // If assessmentId is provided, get existing grades
    let studentsWithGrades: any[] = studentsToReturn;
    if (assessmentId) {
      const grades = await Grade.find({
        assessmentId: assessmentId
      });

      const gradeMap = new Map(
        grades.map(grade => [grade.studentId.toString(), grade])
      );

      studentsWithGrades = studentsToReturn.map(student => ({
        ...student.toObject(),
        grade: gradeMap.get(student._id.toString()) || null
      }));
    }

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
      section: section
    });

  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}