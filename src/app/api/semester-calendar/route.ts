import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Semester from '@/models/Semester';
import Holiday from '@/models/Holiday';
import MakeupClass from '@/models/MakeupClass';
import WeeklyTimetable from '@/models/WeeklyTimetable';

// Generate all dates between start and end
function generateSemesterDays(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Group dates into weeks (Sunday to Saturday)
function groupIntoWeeks(dates: Date[]): Date[][] {
  const weeks: Date[][] = [];
  let week: Date[] = [];

  dates.forEach((date) => {
    week.push(new Date(date));

    // Saturday is end of week (day 6)
    if (date.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
  });

  // Add remaining days as last week
  if (week.length > 0) {
    weeks.push(week);
  }

  return weeks;
}

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

    // Fetch semester
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return NextResponse.json(
        { success: false, error: 'Semester not found' },
        { status: 404 }
      );
    }

    // Generate all days
    const allDays = generateSemesterDays(semester.startDate, semester.endDate);

    // Group into weeks
    const weeks = groupIntoWeeks(allDays);

    // Fetch holidays and makeup classes
    const holidays = await Holiday.find({ semesterId });
    const makeupClasses = await MakeupClass.find({ semesterId }).populate('courseId').populate('teacherId');
    const weeklyTimetable = await WeeklyTimetable.find({ semesterId })
      .populate('courseId')
      .populate('teacherId');

    // Create holiday date map for quick lookup
    const holidayMap = new Map<string, string>();
    holidays.forEach((h) => {
      const dateStr = h.date.toISOString().split('T')[0];
      holidayMap.set(dateStr, h.reason);
    });

    // Create makeup class map for quick lookup
    const makeupMap = new Map<string, any>();
    makeupClasses.forEach((m) => {
      const dateStr = m.date.toISOString().split('T')[0];
      if (!makeupMap.has(dateStr)) {
        makeupMap.set(dateStr, []);
      }
      makeupMap.get(dateStr).push(m);
    });

    // Build calendar with weeks
    const calendar = weeks.map((weekDays, weekIndex) => {
      const weekNumber = weekIndex + 1;
      const weekStart = weekDays[0];
      const weekEnd = weekDays[weekDays.length - 1];

      const daySchedules = weekDays.map((date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        // Check if holiday
        if (holidayMap.has(dateStr)) {
          return {
            date: dateStr,
            dayOfWeek,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
            isHoliday: true,
            holidayReason: holidayMap.get(dateStr),
            classes: [],
          };
        }

        // Get makeup classes for this date
        const makeupForDate = makeupMap.get(dateStr) || [];

        // Get regular timetable for this day of week
        const regularClasses = weeklyTimetable.filter((t) => t.dayOfWeek === dayOfWeek);

        // Combine makeup and regular classes
        const allClasses = [
          ...makeupForDate.map((m) => ({
            type: 'makeup',
            courseId: m.courseId,
            teacherId: m.teacherId,
            startTime: m.startTime,
            endTime: m.endTime,
            room: m.room,
            creditHours: m.creditHours,
            reason: m.reason,
          })),
          ...regularClasses.map((r) => ({
            type: 'regular',
            courseId: r.courseId,
            teacherId: r.teacherId,
            startTime: r.startTime,
            endTime: r.endTime,
            room: r.room,
            creditHours: r.creditHours,
          })),
        ];

        return {
          date: dateStr,
          dayOfWeek,
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
          isHoliday: false,
          classes: allClasses,
        };
      });

      return {
        weekNumber,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        days: daySchedules,
      };
    });

    return NextResponse.json({
      success: true,
      semester: {
        _id: semester._id,
        name: semester.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
      },
      totalWeeks: weeks.length,
      totalDays: allDays.length,
      calendar,
    });
  } catch (error: any) {
    console.error('Error generating semester calendar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
