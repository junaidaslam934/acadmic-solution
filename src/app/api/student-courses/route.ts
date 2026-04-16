import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');
    
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }
    
    // Get student info
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Get courses for student's year and semester
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const coursesCollection = db.collection('allcourses');
    const filter: any = { year: student.year };
    
    if (semester) {
      filter.semester = parseInt(semester);
    }
    
    const courses = await coursesCollection
      .find(filter)
      .sort({ semester: 1, courseCode: 1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      student: {
        _id: student._id,
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        year: student.year,
        section: student.section,
        coursesEnrolled: student.coursesEnrolled || [],
      },
      courses 
    });
  } catch (error: any) {
    console.error('Error fetching student courses:', error);
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
    const { studentId, courseId } = body;
    
    if (!studentId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student ID and Course ID required' },
        { status: 400 }
      );
    }
    
    // Get student
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Check if course exists
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const coursesCollection = db.collection('allcourses');
    const course = await coursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if already enrolled
    if (student.coursesEnrolled && student.coursesEnrolled.includes(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }
    
    // Add course to student's enrolled courses
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $push: { coursesEnrolled: courseId } },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Course enrolled successfully',
      student: updatedStudent 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
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
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    
    if (!studentId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Student ID and Course ID required' },
        { status: 400 }
      );
    }
    
    // Remove course from student's enrolled courses
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $pull: { coursesEnrolled: courseId } },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Course dropped successfully',
      student: updatedStudent 
    });
  } catch (error: any) {
    console.error('Error dropping course:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
