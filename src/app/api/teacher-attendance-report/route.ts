import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const semesterId = searchParams.get('semesterId');
    const courseId = searchParams.get('courseId');

    if (!teacherId || !semesterId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID and Semester ID are required' },
        { status: 400 }
      );
    }

    const filter: any = {
      teacherId,
      semesterId,
    };

    if (courseId) {
      filter.courseId = courseId;
    }

    // Fetch all attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate('courseId')
      .populate('semesterId')
      .sort({ weekNumber: 1, date: 1 });

    // Group by course
    const courseMap = new Map<string, any>();

    attendanceRecords.forEach((record: any) => {
      const courseId = record.courseId._id.toString();
      const courseName = (record.courseId as any).courseName;
      const courseCode = (record.courseId as any).courseCode;

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseCode,
          courseName,
          weeks: new Map<number, any>(),
          totalCreditHours: 0,
          totalStudents: new Set<string>(),
        });
      }

      const course = courseMap.get(courseId);
      course.totalCreditHours += record.creditHours;

      // Add students to set
      record.attendanceRecords.forEach((att: any) => {
        course.totalStudents.add(att.studentId.toString());
      });

      // Group by week
      if (!course.weeks.has(record.weekNumber)) {
        course.weeks.set(record.weekNumber, {
          weekNumber: record.weekNumber,
          classes: [],
          totalCreditHours: 0,
          studentAttendance: new Map<string, any>(),
        });
      }

      const week = course.weeks.get(record.weekNumber);
      week.totalCreditHours += record.creditHours;

      // Add class details
      week.classes.push({
        date: record.date,
        creditHours: record.creditHours,
        totalStudents: record.attendanceRecords.length,
        presentCount: record.attendanceRecords.filter((a: any) => !a.isAbsent).length,
        absentCount: record.attendanceRecords.filter((a: any) => a.isAbsent).length,
      });

      // Track student attendance
      record.attendanceRecords.forEach((att: any) => {
        const studentId = att.studentId.toString();
        if (!week.studentAttendance.has(studentId)) {
          week.studentAttendance.set(studentId, {
            studentId,
            studentName: att.studentName,
            rollNumber: att.rollNumber,
            presentSessions: 0,
            absentSessions: 0,
            creditHoursPresent: 0,
            creditHoursAbsent: 0,
          });
        }

        const student = week.studentAttendance.get(studentId);
        if (att.isAbsent) {
          student.absentSessions += 1;
          student.creditHoursAbsent += record.creditHours;
        } else {
          student.presentSessions += 1;
          student.creditHoursPresent += record.creditHours;
        }
      });
    });

    // Convert to array format
    const report = Array.from(courseMap.values()).map((course: any) => ({
      courseId: course.courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      totalCreditHours: course.totalCreditHours,
      totalStudents: course.totalStudents.size,
      weeks: Array.from(course.weeks.values()).map((week: any) => ({
        weekNumber: week.weekNumber,
        totalCreditHours: week.totalCreditHours,
        classes: week.classes,
        studentAttendance: Array.from(week.studentAttendance.values()),
      })),
    }));

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
