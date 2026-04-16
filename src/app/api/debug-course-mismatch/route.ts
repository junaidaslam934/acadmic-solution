import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Get all course IDs from assignments
    const assignmentsCollection = db.collection('courseasigned');
    const assignments = await assignmentsCollection.find({}).toArray();
    const assignmentCourseIds = assignments.map(a => a.courseId.toString());
    
    // Get all course IDs from allcourses
    const coursesCollection = db.collection('allcourses');
    const courses = await coursesCollection.find({}).toArray();
    const allCourseIds = courses.map(c => c._id.toString());
    
    // Find mismatches
    const missingCourses = assignmentCourseIds.filter(id => !allCourseIds.includes(id));
    const availableCourses = assignmentCourseIds.filter(id => allCourseIds.includes(id));
    
    // Get sample data
    const sampleAssignments = assignments.slice(0, 5).map(a => ({
      _id: a._id,
      teacherId: a.teacherId,
      courseId: a.courseId,
      year: a.year,
      semester: a.semester
    }));
    
    const sampleCourses = courses.slice(0, 5).map(c => ({
      _id: c._id,
      courseCode: c.courseCode || c.code,
      courseName: c.courseName || c.name,
      credits: c.totalCreditHours || c.credits
    }));
    
    return NextResponse.json({
      success: true,
      summary: {
        totalAssignments: assignments.length,
        totalCourses: courses.length,
        uniqueAssignmentCourseIds: [...new Set(assignmentCourseIds)].length,
        missingCoursesCount: missingCourses.length,
        availableCoursesCount: availableCourses.length
      },
      missingCourses: missingCourses,
      availableCourses: availableCourses,
      sampleAssignments: sampleAssignments,
      sampleCourses: sampleCourses,
      allCourseIds: allCourseIds.slice(0, 10), // First 10 course IDs
      assignmentCourseIds: [...new Set(assignmentCourseIds)] // Unique assignment course IDs
    });
    
  } catch (error) {
    console.error('Debug course mismatch error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}