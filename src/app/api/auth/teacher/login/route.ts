import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { teacherId } = await request.json();
    
    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: 'Teacher ID is required' },
        { status: 400 }
      );
    }
    
    // Trim whitespace from the ID
    const trimmedId = teacherId.trim();
    
    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      return NextResponse.json(
        { success: false, message: `Invalid Teacher ID format. Please check the ID: ${trimmedId}` },
        { status: 400 }
      );
    }
    
    // Find teacher by ID
    const teacher = await Teacher.findById(trimmedId);
    
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        employeeId: teacher.employeeId,
        department: teacher.department,
      },
    });
  } catch (error: any) {
    console.error('Teacher login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}
