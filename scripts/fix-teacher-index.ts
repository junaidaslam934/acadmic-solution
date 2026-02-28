import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

async function fixTeacherIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const collection = db.collection('teachers');
    
    console.log('Dropping unique index on email field...');
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Successfully dropped email unique index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️ Index does not exist, skipping...');
      } else {
        throw error;
      }
    }
    
    console.log('Clearing existing teachers...');
    await collection.deleteMany({});
    console.log('✅ Teachers collection cleared');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTeacherIndex();
