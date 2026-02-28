import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

// Define the course data
const dsaCourse = {
  courseCode: 'DSA101',
  courseName: 'dsa',
  year: 1,
  semester: 1,
  credits: 4,
  department: 'Computer Science',
  description: 'Data Structures and Algorithms course for first year students',
};

async function seedDSACourse() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    // Access the allcourses collection directly
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const collection = db.collection('allcourses');
    
    console.log('Inserting DSA course...');
    const result = await collection.insertOne(dsaCourse);
    
    console.log('✅ Course inserted successfully!');
    console.log(`Course ID: ${result.insertedId}`);
    console.log('\nCourse Details:');
    console.log('─'.repeat(50));
    console.log(`Course Code: ${dsaCourse.courseCode}`);
    console.log(`Course Name: ${dsaCourse.courseName}`);
    console.log(`Year: ${dsaCourse.year}`);
    console.log(`Semester: ${dsaCourse.semester}`);
    console.log(`Credits: ${dsaCourse.credits}`);
    console.log(`Department: ${dsaCourse.department}`);
    console.log(`Description: ${dsaCourse.description}`);
    console.log('─'.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding course:', error);
    process.exit(1);
  }
}

seedDSACourse();
