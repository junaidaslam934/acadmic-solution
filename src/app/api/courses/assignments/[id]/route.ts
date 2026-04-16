import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';

// DELETE: Remove a course assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const assignmentId = params.id;

    // Find and delete the assignment
    const assignment = await CourseAssignment.findByIdAndUpdate(
      assignmentId,
      { isActive: false },
      { new: true }
    );

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment removed successfully'
    });

  } catch (error) {
    console.error('Error deleting course assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course assignment' },
      { status: 500 }
    );
  }
}

// GET: Get specific assignment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const assignmentId = params.id;

    const assignment = await CourseAssignment.findById(assignmentId)
      .populate('teacherId', 'name email employeeId specialization')
      .populate('courseId', 'courseCode courseName totalCreditHours department');

    if (!assignment || !assignment.isActive) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment
    });

  } catch (error) {
    console.error('Error fetching course assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course assignment' },
      { status: 500 }
    );
  }
}

// PUT: Update specific assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const assignmentId = params.id;
    const {
      creditHours,
      teachingRole,
      responsibilities,
      isPreferred
    } = await request.json();

    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment || !assignment.isActive) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // If credit hours are being changed, validate total doesn't exceed course limit
    if (creditHours && creditHours !== assignment.creditHours) {
      const Course = (await import('@/models/Course')).default;
      const course = await Course.findById(assignment.courseId);
      
      const otherAssignments = await CourseAssignment.find({
        courseId: assignment.courseId,
        year: assignment.year,
        semester: assignment.semester,
        _id: { $ne: assignmentId },
        isActive: true
      });

      const otherAssignedHours = otherAssignments.reduce(
        (sum, a) => sum + a.creditHours, 
        0
      );

      if (otherAssignedHours + creditHours > course.totalCreditHours) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot assign ${creditHours} hours. Total would exceed course limit of ${course.totalCreditHours} hours.`
          },
          { status: 400 }
        );
      }
    }

    // Update assignment
    if (creditHours) assignment.creditHours = creditHours;
    if (teachingRole) assignment.teachingRole = teachingRole;
    if (responsibilities) assignment.responsibilities = responsibilities;
    if (isPreferred !== undefined) assignment.isPreferred = isPreferred;

    await assignment.save();

    // Populate the response
    await assignment.populate('teacherId', 'name email employeeId');
    await assignment.populate('courseId', 'courseCode courseName totalCreditHours');

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Assignment updated successfully'
    });

  } catch (error) {
    console.error('Error updating course assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course assignment' },
      { status: 500 }
    );
  }
}