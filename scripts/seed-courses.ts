import Course from '../src/models/Course';
import connectDB from '../src/lib/mongodb';

const courses = [
  // 1st Year Courses - All Semester 1
  { courseCode: 'CS101', courseName: 'Introduction to Programming', year: 1, semester: 1, credits: 4, department: 'Computer Science', description: 'Fundamentals of programming using Python' },
  { courseCode: 'MATH101', courseName: 'Calculus I', year: 1, semester: 1, credits: 4, department: 'Mathematics', description: 'Differential and integral calculus' },
  { courseCode: 'ENG101', courseName: 'English Composition', year: 1, semester: 1, credits: 3, department: 'English', description: 'Academic writing and communication skills' },
  { courseCode: 'PHY101', courseName: 'Physics I', year: 1, semester: 1, credits: 4, department: 'Physics', description: 'Mechanics and thermodynamics' },
  { courseCode: 'CS102', courseName: 'Data Structures', year: 1, semester: 1, credits: 4, department: 'Computer Science', description: 'Arrays, linked lists, stacks, queues, trees' },
  { courseCode: 'MATH102', courseName: 'Linear Algebra', year: 1, semester: 1, credits: 3, department: 'Mathematics', description: 'Vectors, matrices, and linear transformations' },

  // 2nd Year Courses - All Semester 1
  { courseCode: 'CS201', courseName: 'Object-Oriented Programming', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'OOP concepts using Java' },
  { courseCode: 'CS202', courseName: 'Database Management Systems', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'SQL, relational databases, normalization' },
  { courseCode: 'STAT201', courseName: 'Probability and Statistics', year: 2, semester: 1, credits: 3, department: 'Statistics', description: 'Statistical analysis and probability theory' },
  { courseCode: 'CS203', courseName: 'Computer Networks', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'Network protocols, TCP/IP, OSI model' },
  { courseCode: 'CS204', courseName: 'Operating Systems', year: 2, semester: 1, credits: 4, department: 'Computer Science', description: 'Process management, memory, file systems' },
  { courseCode: 'MATH201', courseName: 'Discrete Mathematics', year: 2, semester: 1, credits: 3, department: 'Mathematics', description: 'Logic, sets, graphs, combinatorics' },

  // 3rd Year Courses - All Semester 1
  { courseCode: 'CS301', courseName: 'Software Engineering', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'SDLC, design patterns, agile methodologies' },
  { courseCode: 'CS302', courseName: 'Web Development', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'HTML, CSS, JavaScript, React, Node.js' },
  { courseCode: 'CS303', courseName: 'Artificial Intelligence', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'Search algorithms, machine learning basics' },
  { courseCode: 'CS304', courseName: 'Computer Graphics', year: 3, semester: 1, credits: 3, department: 'Computer Science', description: '2D/3D graphics, rendering, animation' },
  { courseCode: 'CS305', courseName: 'Mobile App Development', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'Android and iOS development' },
  { courseCode: 'CS306', courseName: 'Cybersecurity', year: 3, semester: 1, credits: 4, department: 'Computer Science', description: 'Network security, cryptography, ethical hacking' },

  // 4th Year Courses - All Semester 1
  { courseCode: 'CS401', courseName: 'Machine Learning', year: 4, semester: 1, credits: 4, department: 'Computer Science', description: 'Supervised and unsupervised learning algorithms' },
  { courseCode: 'CS402', courseName: 'Cloud Computing', year: 4, semester: 1, credits: 4, department: 'Computer Science', description: 'AWS, Azure, microservices, containers' },
  { courseCode: 'CS403', courseName: 'Big Data Analytics', year: 4, semester: 1, credits: 3, department: 'Computer Science', description: 'Hadoop, Spark, data processing at scale' },
  { courseCode: 'CS404', courseName: 'Blockchain Technology', year: 4, semester: 1, credits: 3, department: 'Computer Science', description: 'Distributed ledgers, smart contracts, DApps' },
  { courseCode: 'CS405', courseName: 'DevOps and CI/CD', year: 4, semester: 1, credits: 4, department: 'Computer Science', description: 'Docker, Kubernetes, Jenkins, automation' },
  { courseCode: 'CS499', courseName: 'Capstone Project', year: 4, semester: 1, credits: 6, department: 'Computer Science', description: 'Final year project and thesis' },
];

async function seedCourses() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Clearing existing courses...');
    await Course.deleteMany({});
    
    console.log('Inserting courses...');
    const result = await Course.insertMany(courses);
    
    console.log(`✅ Successfully inserted ${result.length} courses!`);
    console.log('\nCourses by year:');
    for (let year = 1; year <= 4; year++) {
      const yearCourses = result.filter(c => c.year === year);
      console.log(`  Year ${year}: ${yearCourses.length} courses`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
