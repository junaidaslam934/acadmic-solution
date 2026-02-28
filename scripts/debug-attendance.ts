import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

async function debugAttendance() {
  try {
    await connectDB();

    const studentId = '69907617169b84ee5fa70c06';
    
    console.log('=== DEBUGGING ATTENDANCE FOR STUDENT ===');
    console.log('Student ID:', studentId);
    
    // Get all attendance records
    const allRecords = await Attendance.find({}).lean();
    console.log(`Total attendance records in DB: ${allRecords.length}`);
    
    // Check each record for this student
    let foundRecords = 0;
    for (const record of allRecords) {
      if (record.attendanceRecords && Array.isArray(record.attendanceRecords)) {
        for (const ar of record.attendanceRecords) {
          if (ar && ar.studentId) {
            const arStudentId = ar.studentId.toString();
            if (arStudentId === studentId) {
              foundRecords++;
              console.log('=== FOUND RECORD ===');
              console.log('Record ID:', record._id);
              console.log('Course ID:', record.courseId);
              console.log('Week Number:', record.weekNumber);
              console.log('Student Record:', {
                studentId: ar.studentId,
                studentName: ar.studentName,
                rollNumber: ar.rollNumber,
                isAbsent: ar.isAbsent
              });
              console.log('---');
            }
          }
        }
      }
    }
    
    console.log(`Found ${foundRecords} attendance records for student ${studentId}`);
    
    // Try the MongoDB query
    const queryResult = await Attendance.find({
      'attendanceRecords.studentId': new mongoose.Types.ObjectId(studentId)
    }).lean();
    
    console.log(`MongoDB query found ${queryResult.length} records`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugAttendance();