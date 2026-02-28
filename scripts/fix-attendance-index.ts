import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

async function fixAttendanceIndex() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection failed');
      return;
    }

    const collection = db.collection('attendanceoverall');

    // Drop the old index
    try {
      await collection.dropIndex('teacherId_1_courseId_1_weekNumber_1');
      console.log('Dropped old index: teacherId_1_courseId_1_weekNumber_1');
    } catch (err: any) {
      if (err.code === 27) {
        console.log('Old index does not exist');
      } else {
        console.error('Error dropping old index:', err);
      }
    }

    // Create the new index with sessionNumber
    try {
      await collection.createIndex(
        { teacherId: 1, courseId: 1, weekNumber: 1, sessionNumber: 1 },
        { unique: true }
      );
      console.log('Created new index: teacherId_1_courseId_1_weekNumber_1_sessionNumber_1');
    } catch (err) {
      console.error('Error creating new index:', err);
    }

    console.log('Index migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAttendanceIndex();
