import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';
import Teacher from '../src/models/Teacher';

async function debugDB() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    // Check teachers collection
    console.log('\n=== TEACHERS COLLECTION ===');
    const teachersCount = await Teacher.countDocuments();
    console.log(`Total teachers in Mongoose model: ${teachersCount}`);
    
    const teachers = await Teacher.find().limit(5);
    console.log('First 5 teachers:');
    teachers.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} (${t.employeeId}) - ${t.email}`);
    });
    
    // Check allcourses collection
    console.log('\n=== ALLCOURSES COLLECTION ===');
    const coursesCollection = db.collection('allcourses');
    const coursesCount = await coursesCollection.countDocuments();
    console.log(`Total courses in allcourses: ${coursesCount}`);
    
    const courses = await coursesCollection.find({}).limit(5).toArray();
    console.log('First 5 courses:');
    courses.forEach((c, i) => {
      console.log(`${i + 1}. ${c.courseCode} - ${c.courseName} (Year ${c.year})`);
    });
    
    // Check courses collection (Mongoose)
    console.log('\n=== COURSES COLLECTION (Mongoose) ===');
    const coursesMongoose = db.collection('courses');
    const mongooseCoursesCount = await coursesMongoose.countDocuments();
    console.log(`Total courses in courses collection: ${mongooseCoursesCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDB();
