import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Teacher from '@/models/Teacher';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const courseId = searchParams.get('courseId');
    const year = searchParams.get('year');
    const section = searchParams.get('section');
    const date = searchParams.get('date');
    const weekNumber = searchParams.get('weekNumber');
    const semesterId = searchParams.get('semesterId');
    
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID required' },
        { status: 400 }
      );
    }
    
    const filter: any = { teacherId };
    if (courseId) filter.courseId = courseId;
    if (year) filter.year = parseInt(year);
    if (section) filter.section = section;
    if (weekNumber) filter.weekNumber = parseInt(weekNumber);
    if (semesterId) filter.semesterId = semesterId;
    
    // If date is provided, get attendance for that specific date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(100);
    
    return NextResponse.json({ success: true, attendance });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
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
    const { 
      teacherId, 
      courseId, 
      courseName, 
      year, 
      section, 
      attendanceRecords,
      weekId,
      weekNumber,
      semesterId,
      creditHours = 1,
      sessionNumber = 1
    } = body;
    
    if (!teacherId || !courseId || !year || !section || !attendanceRecords) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }
    
    // Get course details to check credits
    const db = mongoose.connection.db;
    let courseCredits = 1;
    
    if (db) {
      const coursesCollection = db.collection('allcourses');
      const course = await coursesCollection.findOne({ 
        _id: new mongoose.Types.ObjectId(courseId) 
      });
      
      if (course) {
        courseCredits = course.credits || 1;
      }
    }
    
    // Validate session number doesn't exceed credit hours
    if (sessionNumber > courseCredits) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Course has ${courseCredits} credit hour(s). Session ${sessionNumber} exceeds maximum.` 
        },
        { status: 400 }
      );
    }
    
    // Check if this exact session already exists
    const sessionNum = sessionNumber || 1; // Ensure we have a valid session number
    
    const existingRecord = await Attendance.findOne({
      teacherId,
      courseId,
      weekNumber: weekNumber || 1,
      sessionNumber: sessionNum,
    });

    if (existingRecord) {
      // Update the existing record
      existingRecord.attendanceRecords = attendanceRecords.map((record: any) => ({
        studentId: record.studentId,
        studentName: record.studentName,
        rollNumber: record.rollNumber,
        isAbsent: record.isAbsent || false,
      }));
      existingRecord.date = new Date();
      await existingRecord.save();

      return NextResponse.json(
        { success: true, message: `Attendance updated for session ${sessionNum}`, attendance: existingRecord },
        { status: 201 }
      );
    } else {
      // Create a completely new record
      const newAttendance = new Attendance({
        teacherId,
        courseId,
        courseName,
        year,
        section,
        semesterId,
        weekNumber: weekNumber || 1,
        sessionNumber: sessionNum,
        date: new Date(),
        creditHours: courseCredits,
        attendanceRecords: attendanceRecords.map((record: any) => ({
          studentId: record.studentId,
          studentName: record.studentName,
          rollNumber: record.rollNumber,
          isAbsent: record.isAbsent || false,
        })),
      });

      await newAttendance.save();

      return NextResponse.json(
        { success: true, message: `New attendance record created for session ${sessionNum}`, attendance: newAttendance },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error recording attendance:', error);
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
    const { attendanceId, attendanceRecords } = body;
    
    if (!attendanceId || !attendanceRecords) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      { attendanceRecords },
      { new: true }
    );
    
    if (!attendance) {
      return NextResponse.json(
        { success: false, error: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, attendance });
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
