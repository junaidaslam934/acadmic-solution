import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseOutline from '@/models/CourseOutline';
import CourseAssignment from '@/models/CourseAssignment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const teacherId = searchParams.get('teacherId');
    const status = searchParams.get('status');
    const currentReviewerRole = searchParams.get('currentReviewerRole');

    const filter: Record<string, unknown> = {};
    if (semesterId) filter.semesterId = semesterId;
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;
    if (currentReviewerRole) filter.currentReviewerRole = currentReviewerRole;

    const outlines = await CourseOutline.find(filter)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName abbreviation')
      .populate('assignmentId')
      .populate('semesterId', 'name status')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: outlines });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { assignmentId, teacherId, courseId, semesterId, fileUrl, fileName, fileType } = body;

    if (!assignmentId || !teacherId || !courseId || !semesterId || !fileUrl || !fileName) {
      return NextResponse.json(
        { success: false, error: 'assignmentId, teacherId, courseId, semesterId, fileUrl, and fileName are required' },
        { status: 400 }
      );
    }

    // Check for existing outline to increment version
    const existing = await CourseOutline.findOne({ assignmentId })
      .sort({ version: -1 })
      .lean() as { version?: number } | null;
    const version = existing ? (existing.version || 1) + 1 : 1;

    const outline = await CourseOutline.create({
      assignmentId,
      teacherId,
      courseId,
      semesterId,
      fileUrl,
      fileName,
      fileType: fileType || 'pdf',
      version,
      status: 'submitted',
      currentReviewerRole: 'class_advisor',
    });

    // Update assignment outline status
    await CourseAssignment.findByIdAndUpdate(assignmentId, {
      outlineStatus: 'submitted',
    });

    return NextResponse.json({ success: true, data: outline }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
