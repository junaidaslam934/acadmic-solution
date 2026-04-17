import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Use the existing course-assignments API pattern
    const response = await fetch(`${request.nextUrl.origin}/api/course-assignments?teacherId=${teacherId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to fetch course assignments');
    }

    return NextResponse.json({
      success: true,
      assignments: data.assignments || []
    });

  } catch (error: any) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}