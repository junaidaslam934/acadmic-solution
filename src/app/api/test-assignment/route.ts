// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const teacherId = searchParams.get('teacherId');

    await connectDB();

    console.log('Testing assignment lookup:', { assignmentId, teacherId });

    // Get all assignments for this teacher
    const allAssignments = await CourseAssignment.find({ teacherId }).limit(10);
    console.log('All assignments for teacher:', allAssignments);

    // Try to find the specific assignment
    const assignment = await CourseAssignment.findById(assignmentId);
    console.log('Specific assignment:', assignment);

    return NextResponse.json({
      success: true,
      assignmentId,
      teacherId,
      allAssignments,
      specificAssignment: assignment
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}