// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';

// GET /api/test-teachers - Test endpoint to check teachers in database
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('Testing teacher collection...');
    
    // Get count of teachers
    const teacherCount = await Teacher.countDocuments();
    console.log(`Total teachers in database: ${teacherCount}`);
    
    // Get all teachers
    const teachers = await Teacher.find({}).limit(10).lean();
    console.log('Sample teachers:', teachers);
    
    // Get collection info
    const collections = await Teacher.db.db.listCollections().toArray();
    const teacherCollection = collections.find(c => c.name === 'teachers');
    
    return NextResponse.json({
      success: true,
      teacherCount,
      sampleTeachers: teachers,
      collectionExists: !!teacherCollection,
      allCollections: collections.map(c => c.name)
    });

  } catch (error: any) {
    console.error('Error testing teachers:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to test teachers',
      error: error.message
    }, { status: 500 });
  }
}