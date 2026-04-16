import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import Teacher from '@/models/Teacher';
import Academic from '@/models/Academic';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Test queries on existing collections
    const adminCount = await Admin.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const academicCount = await Academic.countDocuments();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        connected: true,
        collections: {
          admins: adminCount,
          teachers: teacherCount,
          academics: academicCount,
        },
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
