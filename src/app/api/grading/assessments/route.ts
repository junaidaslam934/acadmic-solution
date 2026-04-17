import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import CourseAssignment from '@/models/CourseAssignment';

// GET /api/grading/assessments?courseId=xxx&teacherId=xxx - Get assessments for a course
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const teacherId = searchParams.get('teacherId');
    
    if (!courseId || !teacherId) {
      return NextResponse.json({
        success: false,
        message: 'Course ID and Teacher ID are required'
      }, { status: 400 });
    }

    // Verify teacher is assigned to this course
    const courseAssignment = await CourseAssignment.findOne({
      courseId,
      teacherId
    });

    if (!courseAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Teacher not assigned to this course'
      }, { status: 403 });
    }

    // Get assessments for the course
    const assessments = await Assessment.find({
      courseId,
      teacherId,
      isActive: true
    })
    .populate('courseId', 'courseCode courseName')
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      assessments
    });

  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch assessments'
    }, { status: 500 });
  }
}

// POST /api/grading/assessments - Create new assessment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { courseId, teacherId, name, type, totalMarks, description, dueDate } = await request.json();
    
    // Validate required fields
    if (!courseId || !teacherId || !name || !type || !totalMarks) {
      return NextResponse.json({
        success: false,
        message: 'All required fields must be provided'
      }, { status: 400 });
    }

    // Validate assessment type
    if (!['practical', 'quiz', 'midterm', 'final'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid assessment type'
      }, { status: 400 });
    }

    // Validate total marks
    if (totalMarks <= 0 || totalMarks > 1000) {
      return NextResponse.json({
        success: false,
        message: 'Total marks must be between 1 and 1000'
      }, { status: 400 });
    }

    // Verify teacher is assigned to this course
    const courseAssignment = await CourseAssignment.findOne({
      courseId,
      teacherId
    });

    if (!courseAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Teacher not assigned to this course'
      }, { status: 403 });
    }

    // Create new assessment
    const assessment = new Assessment({
      courseId,
      teacherId,
      name: name.trim(),
      type,
      totalMarks,
      description: description?.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      isActive: true
    });

    await assessment.save();

    // Populate course information
    await assessment.populate('courseId', 'courseCode courseName');

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create assessment'
    }, { status: 500 });
  }
}