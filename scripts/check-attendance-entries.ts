import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';

async function checkAttendanceEntries() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection failed');
      return;
    }

    const collection = db.collection('attendanceoverall');
    
    // Get all attendance records sorted by creation date
    const records = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray();
    
    console.log(`=== LATEST 20 ATTENDANCE RECORDS ===`);
    console.log(`Total records found: ${records.length}`);
    console.log('');
    
    records.forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${record._id}`);
      console.log(`  Teacher ID: ${record.teacherId}`);
      console.log(`  Course ID: ${record.courseId}`);
      console.log(`  Week Number: ${record.weekNumber}`);
      console.log(`  Session Number: ${record.sessionNumber}`);
      console.log(`  Date: ${record.date}`);
      console.log(`  Created At: ${record.createdAt}`);
      console.log(`  Students Count: ${record.attendanceRecords?.length || 0}`);
      console.log('  ---');
    });
    
    // Check for duplicates
    const duplicates = await collection.aggregate([
      {
        $group: {
          _id: {
            teacherId: "$teacherId",
            courseId: "$courseId", 
            weekNumber: "$weekNumber",
            sessionNumber: "$sessionNumber"
          },
          count: { $sum: 1 },
          records: { $push: { id: "$_id", date: "$date" } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    console.log(`\n=== DUPLICATE ENTRIES ===`);
    console.log(`Found ${duplicates.length} sets of duplicates:`);
    
    duplicates.forEach((dup, index) => {
      console.log(`\nDuplicate Set ${index + 1}:`);
      console.log(`  Teacher: ${dup._id.teacherId}`);
      console.log(`  Course: ${dup._id.courseId}`);
      console.log(`  Week: ${dup._id.weekNumber}`);
      console.log(`  Session: ${dup._id.sessionNumber}`);
      console.log(`  Count: ${dup.count}`);
      console.log(`  Records:`);
      dup.records.forEach((rec: any) => {
        console.log(`    - ID: ${rec.id}, Date: ${rec.date}`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAttendanceEntries();