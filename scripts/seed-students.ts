import Student from '../src/models/Student';
import connectDB from '../src/lib/mongodb';

const generateStudents = () => {
  const students = [];
  const sections = ['A', 'B', 'C'];
  const years = [1, 2, 3, 4];
  const courses = {
    1: ['CS101', 'MATH101', 'ENG101', 'PHY101'],
    2: ['CS201', 'CS202', 'STAT201', 'CS203'],
    3: ['CS301', 'CS302', 'CS303', 'CS304'],
    4: ['CS401', 'CS402', 'CS403', 'CS404'],
  };

  let rollNumberCounter = 1000;

  years.forEach((year) => {
    sections.forEach((section) => {
      // 10 students per section
      for (let i = 1; i <= 10; i++) {
        rollNumberCounter++;
        students.push({
          studentName: `Student ${rollNumberCounter}`,
          rollNumber: `${year}${section}${String(i).padStart(3, '0')}`,
          year: year as 1 | 2 | 3 | 4,
          section: section as 'A' | 'B' | 'C',
          coursesEnrolled: courses[year as keyof typeof courses] || [],
        });
      }
    });
  });

  return students;
};

async function seedStudents() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Clearing existing students...');
    await Student.deleteMany({});

    const students = generateStudents();

    console.log(`Inserting ${students.length} students...`);
    const result = await Student.insertMany(students);

    console.log(`✅ Successfully inserted ${result.length} students!`);
    console.log('\nStudents breakdown:');

    for (let year = 1; year <= 4; year++) {
      const yearStudents = result.filter((s) => s.year === year);
      console.log(`\nYear ${year}: ${yearStudents.length} students`);
      ['A', 'B', 'C'].forEach((section) => {
        const sectionStudents = yearStudents.filter((s) => s.section === section);
        console.log(`  Section ${section}: ${sectionStudents.length} students`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    process.exit(1);
  }
}

seedStudents();
