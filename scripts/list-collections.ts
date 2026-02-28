import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

async function listCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    console.log('\n=== COLLECTIONS IN DATABASE ===\n');
    
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const col = db.collection(collection.name);
      const count = await col.countDocuments();
      console.log(`• ${collection.name} (${count} documents)`);
    }

    console.log('\n=== CHECKING STUDENTS COLLECTION ===\n');
    
    const studentsCol = db.collection('students');
    const studentCount = await studentsCol.countDocuments();
    console.log(`Total students: ${studentCount}`);
    
    if (studentCount > 0) {
      const sampleStudent = await studentsCol.findOne();
      console.log('\nSample student document:');
      console.log(JSON.stringify(sampleStudent, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listCollections();
