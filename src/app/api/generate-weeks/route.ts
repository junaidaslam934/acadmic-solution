import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SemesterWeek from '@/models/SemesterWeek';
import Semester from '@/models/Semester';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { semesterId, weeks } = await request.json();

    if (!semesterId || !weeks || !Array.isArray(weeks)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (weeks.length > 15) {
      return NextResponse.json(
        { success: false, error: 'Maximum 15 weeks allowed' },
        { status: 400 }
      );
    }

    // Verify semester exists
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json(
        { success: false, error: 'Semester not found' },
        { status: 404 }
      );
    }

    // Create or update weeks individually
    const createdWeeks = [];
    for (const week of weeks) {
      const weekData = {
        semesterId,
        weekNumber: week.weekNumber,
        startDate: new Date(week.startDate),
        endDate: new Date(week.endDate),
        isHoliday: week.isHoliday || false,
        holidayReason: week.holidayReason || null,
      };

      // Use findOneAndUpdate to create or update
      const savedWeek = await SemesterWeek.findOneAndUpdate(
        { semesterId, weekNumber: week.weekNumber },
        weekData,
        { upsert: true, new: true }
      );

      createdWeeks.push(savedWeek);
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${createdWeeks.length} week(s)`,
      weeks: createdWeeks,
    });
  } catch (error) {
    console.error('Error creating weeks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create weeks' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    if (!semesterId) {
      return NextResponse.json(
        { success: false, error: 'Semester ID required' },
        { status: 400 }
      );
    }

    const weeks = await SemesterWeek.find({ semesterId }).sort({ weekNumber: 1 });

    return NextResponse.json({
      success: true,
      weeks,
    });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weeks' },
      { status: 500 }
    );
  }
}
