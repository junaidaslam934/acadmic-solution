const mongoose = require('mongoose');

// MongoDB connection
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-portal';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
  email: String,
  name: String,
  employeeId: String,
  password: String,
  specialization: [String],
  isActive: Boolean,
  classAdvisor: String
}, { timestamps: true });

// Student Schema
const StudentSchema = new mongoose.Schema({
  email: String,
  name: String,
  studentId: String,
  password: String,
  section: String,
  semester: Number,
  isActive: Boolean,
  enrolledCourses: [String]
}, { timestamps: true });

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

async function updatePasswords() {
  try {
    await connectDB();

    console.log('🔄 Updating passwords for all users...\n');

    // Update ALL teachers
    const teacherResult = await Teacher.updateMany(
      {},
      { $set: { password: 'qwerty' } }
    );
    console.log(`✅ Updated ${teacherResult.modifiedCount} teachers with password "qwerty"`);

    // Update ALL students
    const studentResult = await Student.updateMany(
      {},
      { $set: { password: 'qwerty' } }
    );
    console.log(`✅ Updated ${studentResult.modifiedCount} students with password "qwerty"`);

    // Show sample data
    const sampleTeachers = await Teacher.find({}).select('name email employeeId password').limit(3);
    console.log('\n📋 Sample Teachers:');
    sampleTeachers.forEach(teacher => {
      console.log(`- ${teacher.name} | Email: ${teacher.email} | Employee ID: ${teacher.employeeId} | Password: ${teacher.password}`);
    });

    const sampleStudents = await Student.find({}).select('name email studentId password section').limit(3);
    console.log('\n📋 Sample Students:');
    sampleStudents.forEach(student => {
      console.log(`- ${student.name} | Email: ${student.email} | Student ID: ${student.studentId} | Password: ${student.password}`);
    });

    console.log('\n🎉 All users can now login with password: qwerty');
    console.log('\nTeacher login example:');
    console.log('Email: ja8886288@gmail.com OR Employee ID: T001');
    console.log('Password: qwerty');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    process.exit(1);
  }
}

updatePasswords();