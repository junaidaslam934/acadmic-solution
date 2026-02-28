import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const semesterId = searchParams.get('semesterId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }

    // Get student info to know their year
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get all courses from allcourses collection for this student's year
    const db = mongoose.connection.db;
    let allCourses: any[] = [];
    
    if (db) {
      const collection = db.collection('allcourses');
      allCourses = await collection
        .find({ year: student.year })
        .sort({ semester: 1, courseCode: 1 })
        .toArray();
    }

    // Build filter for attendance - use a more robust approach
    let attendanceRecords: any[] = [];
    
    console.log(`Searching for student: ${studentId}`);
    
    // Get all attendance records and filter manually for better debugging
    const allAttendanceRecords = await Attendance.find(semesterId ? { semesterId } : {}).lean();
    console.log(`Total attendance records in DB: ${allAttendanceRecords.length}`);
    
    // Filter records that contain this student
    attendanceRecords = allAttendanceRecords.filter(record => {
      if (!record.attendanceRecords || !Array.isArray(record.attendanceRecords)) {
        return false;
      }
      
      return record.attendanceRecords.some((ar: any) => {
        if (!ar || !ar.studentId) return false;
        const arStudentId = ar.studentId.toString();
        return arStudentId === studentId;
      });
    });
    
    console.log(`Found ${attendanceRecords.length} records containing student ${studentId}`);
    
    // Add debugging for the records found
    attendanceRecords.forEach((record, index) => {
      console.log(`Record ${index + 1}:`, {
        id: record._id,
        courseId: record.courseId,
        weekNumber: record.weekNumber,
        sessionNumber: record.sessionNumber,
        studentsCount: record.attendanceRecords?.length
      });
    });

    console.log(`Found ${attendanceRecords.length} attendance records for student ${studentId}`);

    // Group attendance by course/subject
    const subjectWiseAttendance: any = {};

    for (const record of attendanceRecords) {
      // Skip if courseId is missing
      if (!record.courseId) {
        console.warn('Skipping attendance record with missing courseId:', record._id);
        continue;
      }

      // Check if this student has any attendance in this record
      if (!record.attendanceRecords || !Array.isArray(record.attendanceRecords)) {
        console.warn('Skipping record with invalid attendanceRecords:', record._id);
        continue;
      }

      const studentRecord = record.attendanceRecords.find(
        (ar: any) => {
          if (!ar || !ar.studentId) return false;
          const arStudentId = ar.studentId.toString();
          return arStudentId === studentId;
        }
      );

      // Only process if this student is in this attendance record
      if (!studentRecord) {
        continue;
      }

      // Get courseId as string
      const courseIdStr = record.courseId.toString();
      
      // Find course info from allcourses collection
      const courseInfo = allCourses.find(course => course._id.toString() === courseIdStr);
      
      const courseName = courseInfo?.courseName || record.courseName || 'Unknown Course';
      const courseCode = courseInfo?.courseCode || 'N/A';

      if (!subjectWiseAttendance[courseIdStr]) {
        subjectWiseAttendance[courseIdStr] = {
          courseId: courseIdStr,
          courseCode,
          courseName,
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          attendancePercentage: 0,
          weeklyDetails: [],
        };
      }

      subjectWiseAttendance[courseIdStr].totalClasses += 1;

      if (studentRecord.isAbsent) {
        subjectWiseAttendance[courseIdStr].absentClasses += 1;
      } else {
        subjectWiseAttendance[courseIdStr].presentClasses += 1;
      }

      // Add weekly detail
      subjectWiseAttendance[courseIdStr].weeklyDetails.push({
        weekNumber: record.weekNumber,
        sessionNumber: record.sessionNumber || 1,
        date: record.date,
        isAbsent: studentRecord.isAbsent,
        status: studentRecord.isAbsent ? 'Absent' : 'Present',
      });
    }

    // Add all courses (even those with no attendance records yet)
    const result = allCourses.map((course: any) => {
      if (!course || !course._id) {
        return null;
      }

      const courseId = course._id.toString();
      const existing = subjectWiseAttendance[courseId];

      if (existing) {
        return {
          ...existing,
          attendancePercentage:
            existing.totalClasses > 0
              ? Math.round((existing.presentClasses / existing.totalClasses) * 100)
              : 0,
          weeklyDetails: existing.weeklyDetails.sort(
            (a: any, b: any) => a.weekNumber - b.weekNumber
          ),
        };
      } else {
        // Course with no attendance records yet
        return {
          courseId,
          courseCode: course.courseCode || 'N/A',
          courseName: course.courseName || 'Unknown Course',
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
          attendancePercentage: 0,
          weeklyDetails: [],
        };
      }
    }).filter((item: any) => item !== null);

    console.log(`Processed attendance data:`, {
      totalSubjects: result.length,
      subjectsWithAttendance: result.filter(r => r.totalClasses > 0).length,
      subjectWiseAttendance: Object.keys(subjectWiseAttendance).length
    });

    return NextResponse.json({
      success: true,
      attendance: result,
      summary: {
        totalSubjects: result.length,
        overallAttendancePercentage:
          result.filter((r: any) => r.totalClasses > 0).length > 0
            ? Math.round(
                result
                  .filter((r: any) => r.totalClasses > 0)
                  .reduce((sum: number, s: any) => sum + s.attendancePercentage, 0) /
                  result.filter((r: any) => r.totalClasses > 0).length
              )
            : 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
    ``