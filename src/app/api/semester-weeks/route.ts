import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SemesterWeek from '@/models/SemesterWeek';
import Semester from '@/models/Semester';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    if (!semesterId) {
      return NextResponse.json(
        { success: false, error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    const weeks = await SemesterWeek.find({ semesterId }).sort({ weekNumber: 1 });

    return NextResponse.json({ success: true, weeks });
  } catch (error: any) {
    console.error('Error fetching weeks:', error);
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
    const { semesterId, startDate, endDate } = body;

    if (!semesterId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Semester ID, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json(
        { success: false, error: 'Semester not found' },
        { status: 404 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Delete existing weeks for this semester
    await SemesterWeek.deleteMany({ semesterId });

    // Generate weeks
    const weeks = [];
    let currentDate = new Date(start);
    let weekNumber = 1;

    while (currentDate < end) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6); // 7 days per week

      // Ensure week end doesn't exceed semester end
      if (weekEnd > end) {
        weekEnd.setTime(end.getTime());
      }

      const week = new SemesterWeek({
        semesterId,
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        isHoliday: false,
      });

      weeks.push(week);
      weekNumber++;

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Save all weeks
    await SemesterWeek.insertMany(weeks);

    return NextResponse.json(
      { success: true, weeks, message: `Created ${weeks.length} weeks` },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating weeks:', error);
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
    const { weekId, isHoliday, holidayReason } = body;

    if (!weekId) {
      return NextResponse.json(
        { success: false, error: 'Week ID is required' },
        { status: 400 }
      );
    }

    const week = await SemesterWeek.findByIdAndUpdate(
      weekId,
      {
        isHoliday,
        holidayReason: isHoliday ? holidayReason : null,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!week) {
      return NextResponse.json(
        { success: false, error: 'Week not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, week });
  } catch (error: any) {
    console.error('Error updating week:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
