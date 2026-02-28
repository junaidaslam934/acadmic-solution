import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MakeupClass from '@/models/MakeupClass';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    const filter: any = {};
    if (semesterId) filter.semesterId = semesterId;

    const makeupClasses = await MakeupClass.find(filter)
      .populate('courseId')
      .populate('teacherId')
      .sort({ date: 1 });

    return NextResponse.json({ success: true, makeupClasses });
  } catch (error: any) {
    console.error('Error fetching makeup classes:', error);
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
    const { semesterId, courseId, teacherId, date, startTime, endTime, room, creditHours, reason } = body;

    if (!semesterId || !courseId || !teacherId || !date || !startTime || !endTime || !room || !creditHours || !reason) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const makeupClass = new MakeupClass({
      semesterId,
      courseId,
      teacherId,
      date: new Date(date),
      startTime,
      endTime,
      room,
      creditHours,
      reason,
    });

    await makeupClass.save();

    return NextResponse.json({ success: true, makeupClass }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating makeup class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Makeup class ID is required' },
        { status: 400 }
      );
    }

    await MakeupClass.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Makeup class deleted' });
  } catch (error: any) {
    console.error('Error deleting makeup class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
