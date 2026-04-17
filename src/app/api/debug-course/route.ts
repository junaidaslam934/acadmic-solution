// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || '69967819e8fc60446433948d';
    
    console.log('Debug: Looking for courseId:', courseId);
    
    const db = mongoose.connection.db!;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Check allcourses collection
    const allCoursesCollection = db.collection('allcourses');
    
    // Try to find the specific course
    let course = null;
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      course = await allCoursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
    }
    
    if (!course) {
      course = await allCoursesCollection.findOne({ _id: courseId as any });
    }
    
    // Get a sample of all courses to see the structure
    const sampleCourses = await allCoursesCollection.find({}).limit(3).toArray();
    
    // Get all field names from the first course
    const fieldNames = sampleCourses.length > 0 ? Object.keys(sampleCourses[0]) : [];
    
    return NextResponse.json({
      success: true,
      searchedCourseId: courseId,
      foundCourse: course,
      sampleCourses: sampleCourses,
      availableFields: fieldNames,
      totalCourses: await allCoursesCollection.countDocuments()
    });
    
  } catch (error: any) {
    console.error('Debug course error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}