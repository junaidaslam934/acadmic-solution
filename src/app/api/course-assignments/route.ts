import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const semesterId = searchParams.get('semesterId');
    const year = searchParams.get('year');
    const outlineStatus = searchParams.get('outlineStatus');

    const filter: Record<string, unknown> = {};
    if (teacherId) filter.teacherId = teacherId;
    if (semesterId) filter.semesterId = semesterId;
    if (year) filter.year = parseInt(year);
    if (outlineStatus) filter.outlineStatus = outlineStatus;

    const assignments = await CourseAssignment.find(filter)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName credits abbreviation type')
      .populate('semesterId', 'name status academicYear')
      .sort({ year: 1, semester: 1 })
      .lean();

    return NextResponse.json({ success: true, data: assignments, assignments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching assignments:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { teacherId, courseId, semesterId, year, semester, sections, isShared, creditHoursAssigned } = body;

    if (!teacherId || !courseId || !year || !semester) {
      return NextResponse.json(
        { success: false, error: 'teacherId, courseId, year, and semester are required' },
        { status: 400 }
      );
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    const assignmentData: Record<string, unknown> = {
      teacherId,
      courseId,
      year,
      semester,
      outlineStatus: 'pending',
    };
    if (semesterId) assignmentData.semesterId = semesterId;
    if (sections) assignmentData.sections = sections;
    if (isShared !== undefined) assignmentData.isShared = isShared;
    if (creditHoursAssigned) assignmentData.creditHoursAssigned = creditHoursAssigned;

    const assignment = await CourseAssignment.findOneAndUpdate(
      { teacherId, courseId, year, semester, ...(semesterId ? { semesterId } : {}) },
      assignmentData,
      { upsert: true, new: true }
    );

    const populated = await CourseAssignment.findById(assignment._id)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName credits')
      .lean();

    return NextResponse.json({ success: true, data: populated, assignment: populated }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating assignment:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Assignment _id required' }, { status: 400 });
    }

    const assignment = await CourseAssignment.findByIdAndUpdate(_id, updates, { new: true })
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName credits')
      .lean();

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Assignment ID required' }, { status: 400 });
    }

    await CourseAssignment.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Assignment deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
