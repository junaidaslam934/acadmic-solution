import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

const csCourses = [
  // Year 1
  { courseCode: 'CS101', courseName: 'Introduction to Programming', year: 1, semester: 1, credits: 4, department: 'Computer Science', description: 'Fundamentals of programming using Python' },
  { courseCode: 'CS102', courseName: 'Data Structures', year: 1, semester: 2, credits: 4, department: 'Computer Science', description: 'Arrays, linked lists, stacks, queues' },
  { courseCode: 'CS103', courseName: 'Discrete Mathematics', year: 1, semester: 1, credits: 3, department: 'Computer Science', description: 'Logic, sets, relations, functions' },
  { courseCode: 'CS104', courseName: 'Digital Logic', year: 1, semester: 2, credits: 3, department: 'Computer Science', description: 'Boolean algebra, logic gates, circuits' },

  // Year 2
  { courseCode: 'CS201', courseName: 'Object-Oriented Programming', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'OOP concepts using Java' },
  { courseCode: 'CS202', courseName: 'Database Management Systems', year: 2, semester: 2, credits: 4, department: 'Computer Science', description: 'SQL, normalization, transactions' },
  { courseCode: 'CS203', courseName: 'Algorithms', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'Sorting, searching, complexity analysis' },
  { courseCode: 'CS204', courseName: 'Web Development', year: 2, semester: 2, credits: 3, department: 'Computer Science', description: 'HTML, CSS, JavaScript, React' },

  // Year 3
  { courseCode: 'CS301', courseName: 'Operating Systems', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'Process management, memory, scheduling' },
  { courseCode: 'CS302', courseName: 'Computer Networks', year: 3, semester: 2, credits: 4, department: 'Computer Science', description: 'TCP/IP, protocols, network architecture' },
  { courseCode: 'CS303', courseName: 'Software Engineering', year: 3, semester: 1, credits: 3, department: 'Computer Science', description: 'SDLC, design patterns, testing' },
  { courseCode: 'CS304', courseName: 'Artificial Intelligence', year: 3, semester: 2, credits: 3, department: 'Computer Science', description: 'Machine learning, neural networks' },

  // Year 4
  { courseCode: 'CS401', courseName: 'Cloud Computing', year: 4, semester: 1, credits: 3, department: 'Computer Science', description: 'AWS, Azure, cloud architecture' },
  { courseCode: 'CS402', courseName: 'Cybersecurity', year: 4, semester: 2, credits: 3, department: 'Computer Science', description: 'Encryption, authentication, network security' },
  { courseCode: 'CS403', courseName: 'Advanced Algorithms', year: 4, semester: 1, credits: 3, department: 'Computer Science', description: 'Graph algorithms, dynamic programming' },
  { courseCode: 'CS404', courseName: 'Capstone Project', year: 4, semester: 2, credits: 4, department: 'Computer Science', description: 'Final year project' },
];

async function seedCSCourses() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collection = db.collection('allcourses');

    console.log('Clearing existing Computer Science courses...');
    await collection.deleteMany({ department: 'Computer Science' });

    console.log('Inserting 16 Computer Science courses...');
    const result = await collection.insertMany(csCourses);

    console.log(`✅ Successfully inserted ${result.insertedCount} Computer Science courses!`);
    console.log('\nCourses added:');
    console.log('─'.repeat(80));

    const yearGroups = {
      1: csCourses.filter(c => c.year === 1),
      2: csCourses.filter(c => c.year === 2),
      3: csCourses.filter(c => c.year === 3),
      4: csCourses.filter(c => c.year === 4),
    };

    Object.entries(yearGroups).forEach(([year, courses]) => {
      console.log(`\nYear ${year}:`);
      courses.forEach((course) => {
        console.log(`  • ${course.courseCode} - ${course.courseName} (Sem ${course.semester}, ${course.credits} credits)`);
      });
    });

    console.log('─'.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

seedCSCourses();
