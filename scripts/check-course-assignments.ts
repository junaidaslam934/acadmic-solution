import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

async function checkAssignments() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    console.log('\n=== CHECKING COURSE ASSIGNMENTS ===\n');
    
    const assignmentsCol = db.collection('courseasigned');
    const coursesCol = db.collection('allcourses');
    
    const assignments = await assignmentsCol.find({}).toArray();
    const courses = await coursesCol.find({}).toArray();
    
    console.log(`Total assignments: ${assignments.length}`);
    console.log(`Total courses: ${courses.length}`);
    
    console.log('\n=== SAMPLE ASSIGNMENTS ===');
    assignments.slice(0, 3).forEach((a, i) => {
      console.log(`\nAssignment ${i + 1}:`);
      console.log(`  _id: ${a._id}`);
      console.log(`  teacherId: ${a.teacherId}`);
      console.log(`  courseId: ${a.courseId}`);
      console.log(`  courseId type: ${typeof a.courseId}`);
      console.log(`  year: ${a.year}`);
    });
    
    console.log('\n=== SAMPLE COURSES ===');
    courses.slice(0, 3).forEach((c, i) => {
      console.log(`\nCourse ${i + 1}:`);
      console.log(`  _id: ${c._id}`);
      console.log(`  _id type: ${typeof c._id}`);
      console.log(`  courseCode: ${c.courseCode}`);
      console.log(`  courseName: ${c.courseName}`);
    });
    
    // Check if any courseId matches a course _id
    console.log('\n=== MATCHING CHECK ===');
    if (assignments.length > 0 && courses.length > 0) {
      const firstAssignment = assignments[0];
      const courseIdStr = firstAssignment.courseId.toString();
      
      const matchingCourse = courses.find(c => c._id.toString() === courseIdStr);
      
      if (matchingCourse) {
        console.log(`✅ Found matching course for first assignment`);
        console.log(`   Course: ${matchingCourse.courseCode} - ${matchingCourse.courseName}`);
      } else {
        console.log(`❌ NO matching course found for courseId: ${courseIdStr}`);
        console.log(`   Available course IDs:`);
        courses.forEach(c => console.log(`     - ${c._id.toString()}`));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAssignments();
