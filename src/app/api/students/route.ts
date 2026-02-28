import { NextRequest, NextResponse } from 'next/server';
import Student from '@/models/Student';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const students = await Student.find({});
    return NextResponse.json({ success: true, students }, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { studentName, rollNumber, year, section, coursesEnrolled } = body;

    if (!studentName || !rollNumber || !year || !section) {
      return NextResponse.json(
        { success: false, message: 'Student name, roll number, year, and section are required' },
        { status: 400 }
      );
    }

    const student = new Student({
      studentName,
      rollNumber,
      year,
      section,
      coursesEnrolled: coursesEnrolled || [],
    });

    await student.save();

    return NextResponse.json(
      { success: true, message: 'Student added successfully', student },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding student:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Roll number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error adding student' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required' },
        { status: 400 }
      );
    }

    await Student.findByIdAndDelete(studentId);

    return NextResponse.json(
      { success: true, message: 'Student deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting student' },
      { status: 500 }
    );
  }
}
