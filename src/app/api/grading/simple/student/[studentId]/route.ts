import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SimpleGrade from '@/models/SimpleGrade';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    await connectDB();
    const { studentId } = await context.params;

    // Get all grades for the student
    const grades = await SimpleGrade.find({ 
      studentId: studentId 
    }).sort({ year: 1, semester: 1, courseCode: 1 });

    return NextResponse.json({
      success: true,
      grades
    });

  } catch (error: any) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch grades'
    }, { status: 500 });
  }
}