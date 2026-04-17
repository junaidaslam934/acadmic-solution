import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';

// GET /api/chat/teachers - Get available teachers for student
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: 'Student ID is required'
      }, { status: 400 });
    }

    // Simply get all teachers from the Teacher collection
    console.log('Fetching all teachers from database...');
    const teachers = await Teacher.find({}).lean();
    console.log(`Found ${teachers.length} teachers in database`);

    // If no teachers found, let's check if the collection exists
    if (teachers.length === 0) {
      const collections = await Teacher.db.db?.listCollections().toArray() ?? [];
      console.log('Available collections:', collections.map((c: { name: string }) => c.name));
    }

    return NextResponse.json({
      success: true,
      teachers: teachers || []
    });

  } catch (error: any) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch teachers',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}