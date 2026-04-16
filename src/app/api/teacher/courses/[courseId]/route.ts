import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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

    // Verify teacher has access to this course
    const assignment = await CourseAssignment.findOne({
      teacherId: teacherId,
      courseId: params.courseId
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Get course details from allcourses collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const coursesCollection = db.collection('allcourses');
    let course = null;
    
    try {
      if (mongoose.Types.ObjectId.isValid(params.courseId)) {
        course = await coursesCollection.findOne({ 
          _id: new mongoose.Types.ObjectId(params.courseId) 
        });
      }
      
      if (!course) {
        course = await coursesCollection.findOne({ _id: params.courseId });
      }
    } catch (err) {
      console.error('Error finding course:', err);
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      course: {
        _id: course._id,
        courseCode: course.courseCode || 'N/A',
        courseName: course.courseName || 'N/A',
        year: assignment.year,
        semester: assignment.semester,
        credits: course.credits || 0
      },
      assignment: {
        year: assignment.year,
        semester: assignment.semester
      }
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}