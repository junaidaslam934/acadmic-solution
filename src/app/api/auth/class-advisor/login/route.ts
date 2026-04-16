import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import ClassAdvisor from '@/models/ClassAdvisor';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { advisorId } = await request.json();
    
    if (!advisorId) {
      return NextResponse.json(
        { success: false, message: 'Class Advisor ID is required' },
        { status: 400 }
      );
    }
    
    // Trim whitespace from the ID
    const trimmedId = advisorId.trim();
    
    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      console.error('Invalid ID format:', trimmedId, 'Length:', trimmedId.length);
      return NextResponse.json(
        { success: false, message: `Invalid Class Advisor ID format. Please check the ID: ${trimmedId}` },
        { status: 400 }
      );
    }
    
    // Find class advisor by ID
    const advisor = await ClassAdvisor.findById(trimmedId).populate('teacherId');
    
    if (!advisor) {
      return NextResponse.json(
        { success: false, message: 'Class Advisor not found' },
        { status: 404 }
      );
    }
    
    const teacher = advisor.teacherId as any;
    
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher information not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      advisor: {
        id: advisor._id,
        teacherId: teacher._id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        year: advisor.year,
      },
    });
  } catch (error: any) {
    console.error('Class advisor login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}
