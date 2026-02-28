import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

async function checkAdminRaw() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    console.log('\nQuerying admin collection directly...');
    const collection = db.collection('admin');
    const admins = await collection.find({}).toArray();
    
    if (admins.length === 0) {
      console.log('No admins found in collection');
      process.exit(0);
    }
    
    console.log(`Found ${admins.length} admin(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(JSON.stringify(admin, null, 2));
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminRaw();
