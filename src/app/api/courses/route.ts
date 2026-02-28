import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    let courses = [];
    const db = mongoose.connection.db;
    
    if (db) {
      // Always check the raw 'allcourses' collection first (where courses are actually stored)
      const collection = db.collection('allcourses');
      const allCoursesFilter = year ? { year: parseInt(year) } : {};
      courses = await collection.find(allCoursesFilter).sort({ year: 1, semester: 1, courseCode: 1 }).toArray();
    }
    
    // If still no courses, try the Mongoose Course model
    if (courses.length === 0) {
      const filter = year ? { year: parseInt(year) } : {};
      courses = await Course.find(filter).sort({ year: 1, semester: 1, courseCode: 1 });
    }
    
    console.log(`Fetching courses with year filter: ${year || 'all'}, Found: ${courses.length}`);
    
    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const course = await Course.create(body);
    
    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
