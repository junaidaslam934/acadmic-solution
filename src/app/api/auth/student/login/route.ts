import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Try to find student by ID (MongoDB ObjectId)
    let student = await Student.findById(studentId);

    // If not found by ID, try by roll number
    if (!student) {
      student = await Student.findOne({ rollNumber: studentId });
    }

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    if (!student.isActive) {
      return NextResponse.json(
        { success: false, message: 'Student account is inactive' },
        { status: 403 }
      );
    }

    // Return student data
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        student: {
          _id: student._id,
          studentName: student.studentName,
          rollNumber: student.rollNumber,
          year: student.year,
          section: student.section,
          coursesEnrolled: student.coursesEnrolled || [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during student login:', error);
    return NextResponse.json(
      { success: false, message: 'Error during login' },
      { status: 500 }
    );
  }
}
