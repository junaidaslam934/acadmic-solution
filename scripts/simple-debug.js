const { MongoClient } = require('mongodb');

async function debugAttendance() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/academics');
  
  try {
    await client.connect();
    const db = client.db('academics');
    const collection = db.collection('attendanceoverall');
    
    console.log('=== ATTENDANCE DEBUG ===');
    
    // Get all records
    const allRecords = await collection.find({}).toArray();
    console.log(`Total records: ${allRecords.length}`);
    
    // Check first few records
    for (let i = 0; i < Math.min(3, allRecords.length); i++) {
      const record = allRecords[i];
      console.log(`\n--- Record ${i + 1} ---`);
      console.log('ID:', record._id);
      console.log('Course ID:', record.courseId);
      console.log('Week:', record.weekNumber);
      console.log('Session:', record.sessionNumber);
      console.log('Attendance Records Count:', record.attendanceRecords?.length || 0);
      
      if (record.attendanceRecords && record.attendanceRecords.length > 0) {
        console.log('First student:', {
          studentId: record.attendanceRecords[0].studentId,
          studentName: record.attendanceRecords[0].studentName,
          rollNumber: record.attendanceRecords[0].rollNumber,
          isAbsent: record.attendanceRecords[0].isAbsent
        });
      }
    }
    
    // Look for specific student
    const studentId = '69907617169b84ee5fa70c06';
    console.log(`\n=== SEARCHING FOR STUDENT ${studentId} ===`);
    
    let foundCount = 0;
    for (const record of allRecords) {
      if (record.attendanceRecords && Array.isArray(record.attendanceRecords)) {
        for (const ar of record.attendanceRecords) {
          if (ar && ar.studentId && ar.studentId.toString() === studentId) {
            foundCount++;
            console.log(`Found in record ${record._id}, course ${record.courseId}, week ${record.weekNumber}`);
          }
        }
      }
    }
    
    console.log(`Total records found for student: ${foundCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugAttendance();