import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ClassBooking from '@/models/ClassBooking';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const year = searchParams.get('year');
    const section = searchParams.get('section');
    const teacherId = searchParams.get('teacherId');
    const dayOfWeek = searchParams.get('dayOfWeek');

    const filter: Record<string, unknown> = {};
    if (semesterId) filter.semesterId = semesterId;
    if (year) filter.year = parseInt(year);
    if (section) filter.section = section;
    if (teacherId) filter.teacherId = teacherId;
    if (dayOfWeek) filter.dayOfWeek = parseInt(dayOfWeek);

    const bookings = await ClassBooking.find(filter)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName abbreviation type')
      .sort({ dayOfWeek: 1, slotNumber: 1 })
      .lean();

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      semesterId,
      courseId,
      teacherId,
      assignmentId,
      year,
      section,
      dayOfWeek,
      slotNumber,
      startTime,
      endTime,
      room,
    } = body;

    if (!semesterId || !courseId || !teacherId || !year || !section || !dayOfWeek || !slotNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: semesterId, courseId, teacherId, year, section, dayOfWeek, slotNumber' },
        { status: 400 }
      );
    }

    // Check for conflicting slot (same year+section+day+slot)
    const slotConflict = await ClassBooking.findOne({
      semesterId,
      year,
      section,
      dayOfWeek,
      slotNumber,
    });
    if (slotConflict) {
      return NextResponse.json(
        { success: false, error: 'This slot is already booked for this year/section.' },
        { status: 409 }
      );
    }

    // Check for teacher conflict (teacher already teaching at same day+slot)
    const teacherConflict = await ClassBooking.findOne({
      semesterId,
      teacherId,
      dayOfWeek,
      slotNumber,
    });
    if (teacherConflict) {
      return NextResponse.json(
        { success: false, error: 'You already have a class booked at this time slot.' },
        { status: 409 }
      );
    }

    const booking = await ClassBooking.create({
      semesterId,
      courseId,
      teacherId,
      assignmentId,
      year,
      section,
      dayOfWeek,
      slotNumber,
      startTime: startTime || '',
      endTime: endTime || '',
      room: room || '',
    });

    const populated = await ClassBooking.findById(booking._id)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName abbreviation')
      .lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Catch MongoDB duplicate key errors
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Slot conflict: this time slot is already booked.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    }

    await ClassBooking.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Booking deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
