import Teacher from '../src/models/Teacher';
import connectDB from '../src/lib/mongodb';

const teachers = [
  { name: 'Dr. Ahmed Hassan', email: 'ja8886288@gmail.com', employeeId: 'T001', specialization: ['Computer Science', 'Algorithms'] },
  { name: 'Prof. Fatima Khan', email: 'ja8886288@gmail.com', employeeId: 'T002', specialization: ['Mathematics', 'Calculus'] },
  { name: 'Dr. Muhammad Ali', email: 'ja8886288@gmail.com', employeeId: 'T003', specialization: ['Physics', 'Mechanics'] },
  { name: 'Prof. Aisha Malik', email: 'ja8886288@gmail.com', employeeId: 'T004', specialization: ['English', 'Literature'] },
  { name: 'Dr. Hassan Ibrahim', email: 'ja8886288@gmail.com', employeeId: 'T005', specialization: ['Chemistry', 'Organic Chemistry'] },
  { name: 'Prof. Zainab Ahmed', email: 'ja8886288@gmail.com', employeeId: 'T006', specialization: ['Biology', 'Genetics'] },
  { name: 'Dr. Omar Farooq', email: 'ja8886288@gmail.com', employeeId: 'T007', specialization: ['History', 'Ancient History'] },
  { name: 'Prof. Layla Hassan', email: 'ja8886288@gmail.com', employeeId: 'T008', specialization: ['Geography', 'Geopolitics'] },
  { name: 'Dr. Karim Rashid', email: 'ja8886288@gmail.com', employeeId: 'T009', specialization: ['Economics', 'Microeconomics'] },
  { name: 'Prof. Noor Saeed', email: 'ja8886288@gmail.com', employeeId: 'T010', specialization: ['Psychology', 'Cognitive Psychology'] },
  { name: 'Dr. Samir Khan', email: 'ja8886288@gmail.com', employeeId: 'T011', specialization: ['Computer Science', 'Web Development'] },
  { name: 'Prof. Hana Malik', email: 'ja8886288@gmail.com', employeeId: 'T012', specialization: ['Art', 'Digital Art'] },
  { name: 'Dr. Rashid Ahmed', email: 'ja8886288@gmail.com', employeeId: 'T013', specialization: ['Engineering', 'Civil Engineering'] },
  { name: 'Prof. Mona Hassan', email: 'ja8886288@gmail.com', employeeId: 'T014', specialization: ['Music', 'Classical Music'] },
  { name: 'Dr. Tariq Ibrahim', email: 'ja8886288@gmail.com', employeeId: 'T015', specialization: ['Philosophy', 'Ethics'] },
  { name: 'Prof. Dina Farooq', email: 'ja8886288@gmail.com', employeeId: 'T016', specialization: ['Sociology', 'Social Theory'] },
  { name: 'Dr. Walid Saeed', email: 'ja8886288@gmail.com', employeeId: 'T017', specialization: ['Political Science', 'International Relations'] },
  { name: 'Prof. Rania Khan', email: 'ja8886288@gmail.com', employeeId: 'T018', specialization: ['Law', 'Constitutional Law'] },
  { name: 'Dr. Amr Hassan', email: 'ja8886288@gmail.com', employeeId: 'T019', specialization: ['Medicine', 'Cardiology'] },
  { name: 'Prof. Yasmin Ahmed', email: 'ja8886288@gmail.com', employeeId: 'T020', specialization: ['Nursing', 'Patient Care'] },
];

async function seedTeachers() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Dropping email unique index if it exists...');
    try {
      await Teacher.collection.dropIndex('email_1');
      console.log('✅ Dropped email unique index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️ Index does not exist, skipping...');
      } else {
        console.log('⚠️ Error dropping index:', error.message);
      }
    }
    
    console.log('Clearing existing teachers...');
    await Teacher.deleteMany({});
    
    console.log('Inserting 20 teachers...');
    const result = await Teacher.insertMany(teachers);
    
    console.log(`✅ Successfully inserted ${result.length} teachers!`);
    console.log('\nTeachers added:');
    result.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} (${teacher.employeeId}) - ${teacher.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding teachers:', error);
    process.exit(1);
  }
}

seedTeachers();
