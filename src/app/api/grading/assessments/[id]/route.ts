import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import Grade from '@/models/Grade';

// PUT /api/grading/assessments/[id] - Update assessment
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    
    const { teacherId, name, type, totalMarks, description } = await request.json();
    
    if (!teacherId || !name || !type || !totalMarks) {
      return NextResponse.json({
        success: false,
        message: 'All required fields must be provided'
      }, { status: 400 });
    }

    // Find and verify ownership
    const assessment = await Assessment.findOne({
      _id: id,
      teacherId: teacherId
    });

    if (!assessment) {
      return NextResponse.json({
        success: false,
        message: 'Assessment not found or access denied'
      }, { status: 404 });
    }

    // Update assessment
    assessment.name = name.trim();
    assessment.type = type;
    assessment.totalMarks = totalMarks;
    assessment.description = description?.trim();
    
    await assessment.save();
    await assessment.populate('courseId', 'courseCode courseName');

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error: any) {
    console.error('Error updating assessment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update assessment'
    }, { status: 500 });
  }
}

// DELETE /api/grading/assessments/[id] - Delete assessment
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({
        success: false,
        message: 'Teacher ID is required'
      }, { status: 400 });
    }

    // Find and verify ownership
    const assessment = await Assessment.findOne({
      _id: id,
      teacherId: teacherId
    });

    if (!assessment) {
      return NextResponse.json({
        success: false,
        message: 'Assessment not found or access denied'
      }, { status: 404 });
    }

    // Check if there are any grades for this assessment
    const gradeCount = await Grade.countDocuments({
      assessmentId: id
    });

    if (gradeCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete assessment with existing grades'
      }, { status: 400 });
    }

    // Delete the assessment
    await Assessment.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete assessment'
    }, { status: 500 });
  }
}