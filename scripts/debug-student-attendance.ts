import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';

async function debugStudentAttendance() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection failed');
      return;
    }

    const collection = db.collection('attendanceoverall');
    
    console.log('=== DEBUGGING STUDENT ATTENDANCE ===');
    
    // Get all attendance records
    const allRecords = await collection.find({}).toArray();
    console.log(`Total attendance records: ${allRecords.length}`);
    
    if (allRecords.length === 0) {
      console.log('No attendance records found!');
      return;
    }
    
    // Show the structure of the first record
    const firstRecord = allRecords[0];
    console.log('\n=== FIRST RECORD STRUCTURE ===');
    console.log('Record ID:', firstRecord._id);
    console.log('Teacher ID:', firstRecord.teacherId);
    console.log('Course ID:', firstRecord.courseId);
    console.log('Week Number:', firstRecord.weekNumber);
    console.log('Session Number:', firstRecord.sessionNumber);
    console.log('Date:', firstRecord.date);
    console.log('Attendance Records Count:', firstRecord.attendanceRecords?.length || 0);
    
    if (firstRecord.attendanceRecords && firstRecord.attendanceRecords.length > 0) {
      console.log('\n=== FIRST STUDENT IN RECORD ===');
      const firstStudent = firstRecord.attendanceRecords[0];
      console.log('Student ID:', firstStudent.studentId);
      console.log('Student ID Type:', typeof firstStudent.studentId);
      console.log('Student Name:', firstStudent.studentName);
      console.log('Roll Number:', firstStudent.rollNumber);
      console.log('Is Absent:', firstStudent.isAbsent);
      
      // Check all students in this record
      console.log('\n=== ALL STUDENTS IN FIRST RECORD ===');
      firstRecord.attendanceRecords.forEach((student: any, index: number) => {
        console.log(`Student ${index + 1}:`);
        console.log(`  ID: ${student.studentId} (${typeof student.studentId})`);
        console.log(`  Name: ${student.studentName}`);
        console.log(`  Roll: ${student.rollNumber}`);
        console.log(`  Absent: ${student.isAbsent}`);
      });
    }
    
    // Check students collection to get a valid student ID
    const studentsCollection = db.collection('students');
    const students = await studentsCollection.find({}).limit(5).toArray();
    
    console.log('\n=== SAMPLE STUDENTS FROM STUDENTS COLLECTION ===');
    students.forEach((student: any, index: number) => {
      console.log(`Student ${index + 1}:`);
      console.log(`  ID: ${student._id} (${typeof student._id})`);
      console.log(`  Name: ${student.studentName}`);
      console.log(`  Roll: ${student.rollNumber}`);
      console.log(`  Year: ${student.year}`);
      console.log(`  Section: ${student.section}`);
    });
    
    // Test query with first student
    if (students.length > 0) {
      const testStudentId = students[0]._id.toString();
      console.log(`\n=== TESTING QUERIES FOR STUDENT: ${testStudentId} ===`);
      
      // Query 1: ObjectId
      const query1 = await collection.find({
        'attendanceRecords.studentId': new mongoose.Types.ObjectId(testStudentId)
      }).toArray();
      console.log(`Query 1 (ObjectId): Found ${query1.length} records`);
      
      // Query 2: String
      const query2 = await collection.find({
        'attendanceRecords.studentId': testStudentId
      }).toArray();
      console.log(`Query 2 (String): Found ${query2.length} records`);
      
      // Manual search
      let manualCount = 0;
      for (const record of allRecords) {
        if (record.attendanceRecords && Array.isArray(record.attendanceRecords)) {
          for (const ar of record.attendanceRecords) {
            if (ar && ar.studentId) {
              const arStudentId = ar.studentId.toString();
              if (arStudentId === testStudentId) {
                manualCount++;
                break; // Found in this record, move to next record
              }
            }
          }
        }
      }
      console.log(`Manual search: Found ${manualCount} records`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugStudentAttendance();