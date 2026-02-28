import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';

async function cleanupDuplicateAttendance() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection failed');
      return;
    }

    const collection = db.collection('attendanceoverall');
    
    console.log('=== CLEANING UP DUPLICATE ATTENDANCE RECORDS ===');
    
    // Find duplicates where sessionNumber is undefined
    const duplicates = await collection.aggregate([
      {
        $match: {
          sessionNumber: { $exists: false }
        }
      },
      {
        $group: {
          _id: {
            teacherId: "$teacherId",
            courseId: "$courseId", 
            weekNumber: "$weekNumber"
          },
          count: { $sum: 1 },
          records: { 
            $push: { 
              id: "$_id", 
              date: "$date",
              createdAt: "$createdAt",
              attendanceRecords: "$attendanceRecords"
            } 
          }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    console.log(`Found ${duplicates.length} sets of duplicates to clean up`);
    
    for (const dup of duplicates) {
      console.log(`\nProcessing duplicates for:`);
      console.log(`  Teacher: ${dup._id.teacherId}`);
      console.log(`  Course: ${dup._id.courseId}`);
      console.log(`  Week: ${dup._id.weekNumber}`);
      console.log(`  Count: ${dup.count}`);
      
      // Sort by creation date, keep the latest one
      const sortedRecords = dup.records.sort((a: any, b: any) => 
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      
      const keepRecord = sortedRecords[0];
      const deleteRecords = sortedRecords.slice(1);
      
      console.log(`  Keeping: ${keepRecord.id} (${keepRecord.createdAt || keepRecord.date})`);
      
      // Update the kept record to have sessionNumber = 1
      await collection.updateOne(
        { _id: keepRecord.id },
        { $set: { sessionNumber: 1 } }
      );
      
      // Delete the duplicate records
      for (const delRecord of deleteRecords) {
        console.log(`  Deleting: ${delRecord.id} (${delRecord.createdAt || delRecord.date})`);
        await collection.deleteOne({ _id: delRecord.id });
      }
    }
    
    // Also fix any remaining records with undefined sessionNumber
    const updateResult = await collection.updateMany(
      { sessionNumber: { $exists: false } },
      { $set: { sessionNumber: 1 } }
    );
    
    console.log(`\nUpdated ${updateResult.modifiedCount} records to have sessionNumber = 1`);
    
    // Final count
    const finalCount = await collection.countDocuments({});
    console.log(`\nFinal attendance record count: ${finalCount}`);
    
    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupDuplicateAttendance();