import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';

async function testStudentQuery() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection failed');
      return;
    }

    const studentId = '69907617169b84ee5fa70c06'; // Student 1001 from your data
    console.log(`Testing queries for student: ${studentId}`);

    const collection = db.collection('attendanceoverall');
    
    // Test different query approaches
    console.log('\n=== Testing Query Approaches ===');
    
    // Query 1: Direct ObjectId
    try {
      const query1 = await collection.find({
        'attendanceRecords.studentId': new mongoose.Types.ObjectId(studentId)
      }).toArray();
      console.log(`Query 1 (ObjectId): Found ${query1.length} records`);
      
      if (query1.length > 0) {
        const record = query1[0];
        const studentRecord = record.attendanceRecords.find((ar: any) => 
          ar.studentId.toString() === studentId
        );
        console.log('  Student record:', {
          name: studentRecord?.studentName,
          roll: studentRecord?.rollNumber,
          isAbsent: studentRecord?.isAbsent
        });
      }
    } catch (error) {
      console.log('Query 1 failed:', error);
    }
    
    // Query 2: String
    try {
      const query2 = await collection.find({
        'attendanceRecords.studentId': studentId
      }).toArray();
      console.log(`Query 2 (String): Found ${query2.length} records`);
    } catch (error) {
      console.log('Query 2 failed:', error);
    }
    
    // Get all records and check manually
    const allRecords = await collection.find({}).toArray();
    console.log(`\nTotal records in collection: ${allRecords.length}`);
    
    let foundRecords = 0;
    for (const record of allRecords) {
      if (record.attendanceRecords && Array.isArray(record.attendanceRecords)) {
        for (const ar of record.attendanceRecords) {
          if (ar && ar.studentId) {
            const arStudentId = ar.studentId.toString();
            if (arStudentId === studentId) {
              foundRecords++;
              console.log(`\nFound in record ${record._id}:`);
              console.log(`  Course: ${record.courseId}`);
              console.log(`  Week: ${record.weekNumber}`);
              console.log(`  Session: ${record.sessionNumber}`);
              console.log(`  Student: ${ar.studentName} (${ar.rollNumber})`);
              console.log(`  Is Absent: ${ar.isAbsent}`);
              console.log(`  Date: ${record.date}`);
            }
          }
        }
      }
    }
    
    console.log(`\nManual search found: ${foundRecords} records for student ${studentId}`);
    
    // Test the exact query used in the API
    console.log('\n=== Testing API Query Logic ===');
    
    // Simulate the API query
    const attendanceRecords = await collection.find({
      'attendanceRecords.studentId': new mongoose.Types.ObjectId(studentId)
    }).toArray();
    
    console.log(`API-style query found: ${attendanceRecords.length} records`);
    
    // Process like the API does
    const subjectWiseAttendance: any = {};
    
    for (const record of attendanceRecords) {
      const studentRecord = record.attendanceRecords.find((ar: any) => {
        const arStudentId = ar.studentId.toString();
        return arStudentId === studentId;
      });
      
      if (studentRecord) {
        const courseId = record.courseId.toString();
        
        if (!subjectWiseAttendance[courseId]) {
          subjectWiseAttendance[courseId] = {
            courseId,
            totalClasses: 0,
            presentClasses: 0,
            absentClasses: 0,
          };
        }
        
        subjectWiseAttendance[courseId].totalClasses += 1;
        
        if (studentRecord.isAbsent) {
          subjectWiseAttendance[courseId].absentClasses += 1;
        } else {
          subjectWiseAttendance[courseId].presentClasses += 1;
        }
      }
    }
    
    console.log('\nProcessed attendance data:');
    Object.values(subjectWiseAttendance).forEach((subject: any) => {
      const percentage = subject.totalClasses > 0 
        ? Math.round((subject.presentClasses / subject.totalClasses) * 100)
        : 0;
      
      console.log(`  Course ${subject.courseId}:`);
      console.log(`    Total: ${subject.totalClasses}`);
      console.log(`    Present: ${subject.presentClasses}`);
      console.log(`    Absent: ${subject.absentClasses}`);
      console.log(`    Percentage: ${percentage}%`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testStudentQuery();