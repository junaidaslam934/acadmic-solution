import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';

async function removeAttendanceUniqueIndex() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection failed');
      return;
    }

    const collection = db.collection('attendanceoverall');

    // Drop the unique index that's causing the duplicate key error
    try {
      await collection.dropIndex('teacherId_1_courseId_1_weekNumber_1');
      console.log('Dropped unique index: teacherId_1_courseId_1_weekNumber_1');
    } catch (err: any) {
      if (err.code === 27) {
        console.log('Index teacherId_1_courseId_1_weekNumber_1 does not exist');
      } else {
        console.error('Error dropping index:', err);
      }
    }

    // Also try to drop the sessionNumber variant if it exists
    try {
      await collection.dropIndex('teacherId_1_courseId_1_weekNumber_1_sessionNumber_1');
      console.log('Dropped unique index: teacherId_1_courseId_1_weekNumber_1_sessionNumber_1');
    } catch (err: any) {
      if (err.code === 27) {
        console.log('Index teacherId_1_courseId_1_weekNumber_1_sessionNumber_1 does not exist');
      } else {
        console.error('Error dropping sessionNumber index:', err);
      }
    }

    // Create non-unique indexes for performance
    try {
      await collection.createIndex({ teacherId: 1, courseId: 1, weekNumber: 1, sessionNumber: 1 });
      console.log('Created non-unique index for performance');
    } catch (err) {
      console.error('Error creating performance index:', err);
    }

    console.log('Index cleanup completed - attendance entries can now have duplicates');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeAttendanceUniqueIndex();