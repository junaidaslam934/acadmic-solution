import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

async function fixAssignments() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    console.log('\n=== FIXING COURSE ASSIGNMENTS ===\n');
    
    const assignmentsCol = db.collection('courseasigned');
    const coursesCol = db.collection('allcourses');
    
    const assignments = await assignmentsCol.find({}).toArray();
    const courses = await coursesCol.find({}).toArray();
    
    console.log(`Found ${assignments.length} assignments`);
    console.log(`Found ${courses.length} courses in allcourses\n`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found in allcourses collection!');
      console.log('Please run: npm run seed:cs');
      process.exit(1);
    }
    
    // For each assignment, find a matching course by year and update the courseId
    let updated = 0;
    for (const assignment of assignments) {
      const year = assignment.year;
      
      // Find a course for this year
      const matchingCourse = courses.find(c => c.year === year);
      
      if (matchingCourse) {
        const result = await assignmentsCol.updateOne(
          { _id: assignment._id },
          { $set: { courseId: matchingCourse._id } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated assignment ${assignment._id}`);
          console.log(`   Old courseId: ${assignment.courseId}`);
          console.log(`   New courseId: ${matchingCourse._id}`);
          console.log(`   Course: ${matchingCourse.courseCode} - ${matchingCourse.courseName}\n`);
          updated++;
        }
      } else {
        console.log(`⚠️  No course found for year ${year} in assignment ${assignment._id}`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} assignments`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAssignments();
