import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || '69967819e8fc60446433948d';
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Check allcourses collection
    const coursesCollection = db.collection('allcourses');
    
    // Try different ways to find the course
    const results = {
      courseId: courseId,
      searches: {}
    };
    
    // 1. Direct string search
    results.searches.stringSearch = await coursesCollection.findOne({ _id: courseId });
    
    // 2. ObjectId search
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      results.searches.objectIdSearch = await coursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
    }
    
    // 3. Get all courses to see the structure
    const allCourses = await coursesCollection.find({}).limit(5).toArray();
    results.sampleCourses = allCourses.map(c => ({
      _id: c._id,
      _idType: typeof c._id,
      _idString: c._id.toString(),
      courseCode: c.courseCode || c.code,
      courseName: c.courseName || c.name
    }));
    
    // 4. Search by partial ID match
    results.searches.partialMatch = await coursesCollection.find({
      _id: { $regex: courseId.substring(0, 10) }
    }).toArray();
    
    // 5. Check assignments collection for this course ID
    const assignmentsCollection = db.collection('courseasigned');
    const assignments = await assignmentsCollection.find({ courseId: courseId }).toArray();
    const assignmentsObjectId = await assignmentsCollection.find({ 
      courseId: new mongoose.Types.ObjectId(courseId) 
    }).toArray();
    
    results.assignments = {
      stringMatch: assignments.length,
      objectIdMatch: assignmentsObjectId.length,
      sampleAssignment: assignments[0] || assignmentsObjectId[0]
    };
    
    return NextResponse.json({
      success: true,
      results: results
    });
    
  } catch (error) {
    console.error('Verify course data error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}