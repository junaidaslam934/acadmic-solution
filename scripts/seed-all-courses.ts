import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';

const allCourses = [
  // Year 1 - Computer Science
  { courseCode: 'CS101', courseName: 'Introduction to Programming', year: 1, semester: 1, credits: 4, department: 'Computer Science', description: 'Fundamentals of programming using Python' },
  { courseCode: 'CS102', courseName: 'Data Structures', year: 1, semester: 2, credits: 4, department: 'Computer Science', description: 'Arrays, linked lists, stacks, queues' },
  { courseCode: 'CS103', courseName: 'Discrete Mathematics', year: 1, semester: 1, credits: 3, department: 'Computer Science', description: 'Logic, sets, relations, functions' },
  { courseCode: 'CS104', courseName: 'Digital Logic', year: 1, semester: 2, credits: 3, department: 'Computer Science', description: 'Boolean algebra, logic gates, circuits' },

  // Year 2 - Computer Science
  { courseCode: 'CS201', courseName: 'Object-Oriented Programming', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'OOP concepts using Java' },
  { courseCode: 'CS202', courseName: 'Database Management Systems', year: 2, semester: 2, credits: 4, department: 'Computer Science', description: 'SQL, normalization, transactions' },
  { courseCode: 'CS203', courseName: 'Algorithms', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'Sorting, searching, complexity analysis' },
  { courseCode: 'CS204', courseName: 'Web Development', year: 2, semester: 2, credits: 3, department: 'Computer Science', description: 'HTML, CSS, JavaScript, React' },

  // Year 3 - Computer Science
  { courseCode: 'CS301', courseName: 'Operating Systems', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'Process management, memory, scheduling' },
  { courseCode: 'CS302', courseName: 'Computer Networks', year: 3, semester: 2, credits: 4, department: 'Computer Science', description: 'TCP/IP, protocols, network architecture' },
  { courseCode: 'CS303', courseName: 'Software Engineering', year: 3, semester: 1, credits: 3, department: 'Computer Science', description: 'SDLC, design patterns, testing' },
  { courseCode: 'CS304', courseName: 'Artificial Intelligence', year: 3, semester: 2, credits: 3, department: 'Computer Science', description: 'Machine learning, neural networks' },

  // Year 4 - Computer Science
  { courseCode: 'CS401', courseName: 'Cloud Computing', year: 4, semester: 1, credits: 3, department: 'Computer Science', description: 'AWS, Azure, cloud architecture' },
  { courseCode: 'CS402', courseName: 'Cybersecurity', year: 4, semester: 2, credits: 3, department: 'Computer Science', description: 'Encryption, authentication, network security' },
  { courseCode: 'CS403', courseName: 'Advanced Algorithms', year: 4, semester: 1, credits: 3, department: 'Computer Science', description: 'Graph algorithms, dynamic programming' },
  { courseCode: 'CS404', courseName: 'Capstone Project', year: 4, semester: 2, credits: 4, department: 'Computer Science', description: 'Final year project' },

  // Year 1 - Mathematics
  { courseCode: 'MATH101', courseName: 'Calculus I', year: 1, semester: 1, credits: 4, department: 'Mathematics', description: 'Limits, derivatives, applications' },
  { courseCode: 'MATH102', courseName: 'Linear Algebra', year: 1, semester: 2, credits: 3, department: 'Mathematics', description: 'Matrices, vectors, systems of equations' },
  { courseCode: 'MATH103', courseName: 'Statistics', year: 1, semester: 1, credits: 3, department: 'Mathematics', description: 'Probability, distributions, hypothesis testing' },
  { courseCode: 'MATH104', courseName: 'Calculus II', year: 1, semester: 2, credits: 4, department: 'Mathematics', description: 'Integration, series, differential equations' },

  // Year 2 - Mathematics
  { courseCode: 'MATH201', courseName: 'Differential Equations', year: 2, semester: 1, credits: 3, department: 'Mathematics', description: 'First and second order ODEs' },
  { courseCode: 'MATH202', courseName: 'Numerical Methods', year: 2, semester: 2, credits: 3, department: 'Mathematics', description: 'Computational mathematics' },
  { courseCode: 'MATH203', courseName: 'Abstract Algebra', year: 2, semester: 1, credits: 3, department: 'Mathematics', description: 'Groups, rings, fields' },
  { courseCode: 'MATH204', courseName: 'Real Analysis', year: 2, semester: 2, credits: 4, department: 'Mathematics', description: 'Limits, continuity, convergence' },

  // Year 1 - Physics
  { courseCode: 'PHYS101', courseName: 'Physics I', year: 1, semester: 1, credits: 4, department: 'Physics', description: 'Mechanics, waves, thermodynamics' },
  { courseCode: 'PHYS102', courseName: 'Physics II', year: 1, semester: 2, credits: 4, department: 'Physics', description: 'Electricity, magnetism, optics' },
  { courseCode: 'PHYS103', courseName: 'Physics Lab I', year: 1, semester: 1, credits: 1, department: 'Physics', description: 'Experimental physics methods' },
  { courseCode: 'PHYS104', courseName: 'Physics Lab II', year: 1, semester: 2, credits: 1, department: 'Physics', description: 'Advanced experimental techniques' },

  // Year 2 - Physics
  { courseCode: 'PHYS201', courseName: 'Modern Physics', year: 2, semester: 1, credits: 3, department: 'Physics', description: 'Quantum mechanics, relativity' },
  { courseCode: 'PHYS202', courseName: 'Electromagnetic Theory', year: 2, semester: 2, credits: 3, department: 'Physics', description: 'Maxwell equations, wave propagation' },
  { courseCode: 'PHYS203', courseName: 'Thermodynamics', year: 2, semester: 1, credits: 3, department: 'Physics', description: 'Laws of thermodynamics, statistical mechanics' },
  { courseCode: 'PHYS204', courseName: 'Optics', year: 2, semester: 2, credits: 3, department: 'Physics', description: 'Geometric and wave optics' },

  // Year 1 - English
  { courseCode: 'ENG101', courseName: 'English Composition', year: 1, semester: 1, credits: 3, department: 'English', description: 'Academic writing and communication' },
  { courseCode: 'ENG102', courseName: 'Literature Survey', year: 1, semester: 2, credits: 3, department: 'English', description: 'Introduction to world literature' },
  { courseCode: 'ENG103', courseName: 'Technical Writing', year: 1, semester: 1, credits: 2, department: 'English', description: 'Professional and technical communication' },
  { courseCode: 'ENG104', courseName: 'Public Speaking', year: 1, semester: 2, credits: 2, department: 'English', description: 'Oral communication skills' },
];

async function seedAllCourses() {
  try {
    console.log('🚀 Starting comprehensive course seeding...');
    console.log('Connecting to MongoDB...');
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collection = db.collection('allcourses');

    console.log('🗑️  Clearing existing courses...');
    const deleteResult = await collection.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing courses`);

    console.log('📚 Inserting new courses...');
    const result = await collection.insertMany(allCourses);

    console.log(`✅ Successfully inserted ${result.insertedCount} courses!`);
    console.log('\n📋 Course Summary:');
    console.log('═'.repeat(80));

    // Group by department and year
    const departments = ['Computer Science', 'Mathematics', 'Physics', 'English'];
    
    departments.forEach(dept => {
      const deptCourses = allCourses.filter(c => c.department === dept);
      if (deptCourses.length > 0) {
        console.log(`\n🏫 ${dept} Department (${deptCourses.length} courses):`);
        
        for (let year = 1; year <= 4; year++) {
          const yearCourses = deptCourses.filter(c => c.year === year);
          if (yearCourses.length > 0) {
            console.log(`\n   Year ${year}:`);
            yearCourses.forEach(course => {
              console.log(`     • ${course.courseCode} - ${course.courseName}`);
              console.log(`       Semester ${course.semester}, ${course.credits} credits`);
            });
          }
        }
      }
    });

    console.log('\n═'.repeat(80));
    console.log(`🎉 Course seeding completed successfully!`);
    console.log(`   Total courses: ${allCourses.length}`);
    console.log(`   Computer Science: ${allCourses.filter(c => c.department === 'Computer Science').length}`);
    console.log(`   Mathematics: ${allCourses.filter(c => c.department === 'Mathematics').length}`);
    console.log(`   Physics: ${allCourses.filter(c => c.department === 'Physics').length}`);
    console.log(`   English: ${allCourses.filter(c => c.department === 'English').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

seedAllCourses();