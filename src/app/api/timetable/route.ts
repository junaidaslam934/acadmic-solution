import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import CourseAssignment from '@/models/CourseAssignment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');
    const courseId = searchParams.get('courseId');
    const teacherId = searchParams.get('teacherId');

    const filter: any = {};
    if (semesterId) filter.semesterId = semesterId;
    if (courseId) filter.courseId = courseId;
    if (teacherId) filter.teacherId = teacherId;

    const timetable = await Timetable.find(filter)
      .populate('semesterId')
      .populate('courseId')
      .populate('teacherId')
      .sort({ dayOfWeek: 1, startTime: 1 });

    return NextResponse.json({ success: true, timetable });
  } catch (error: any) {
    console.error('Error fetching timetable:', error);
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
    const { semesterId, courseId, teacherId, dayOfWeek, startTime, endTime, room } = body;

    if (!semesterId || !courseId || !teacherId || dayOfWeek === undefined || !startTime || !endTime || !room) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate day of week (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: 'Day of week must be between 0 and 6' },
        { status: 400 }
      );
    }

    // Get course to find credit hours
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const coursesCollection = db.collection('allcourses');
    let course;

    if (mongoose.Types.ObjectId.isValid(courseId)) {
      course = await coursesCollection.findOne({ _id: new mongoose.Types.ObjectId(courseId) });
    }

    if (!course) {
      course = await coursesCollection.findOne({ _id: courseId });
    }

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Calculate credit hours per week
    // Typically: 1 credit hour = 1 hour per week
    const creditHoursPerWeek = course.credits || 0;

    // Check for time conflicts
    const existingSlot = await Timetable.findOne({
      semesterId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    });

    if (existingSlot) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked for this room' },
        { status: 400 }
      );
    }

    const timetableEntry = new Timetable({
      semesterId,
      courseId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
      creditHoursPerWeek,
    });

    await timetableEntry.save();

    return NextResponse.json({ success: true, timetable: timetableEntry }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating timetable entry:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, dayOfWeek, startTime, endTime, room } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Timetable ID is required' },
        { status: 400 }
      );
    }

    const timetable = await Timetable.findByIdAndUpdate(
      id,
      {
        dayOfWeek,
        startTime,
        endTime,
        room,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!timetable) {
      return NextResponse.json(
        { success: false, error: 'Timetable entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, timetable });
  } catch (error: any) {
    console.error('Error updating timetable:', error);
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
        { success: false, error: 'Timetable ID is required' },
        { status: 400 }
      );
    }

    await Timetable.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error: any) {
    console.error('Error deleting timetable:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
