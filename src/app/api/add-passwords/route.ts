import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Update ALL teachers to have password
    const teacherResult = await Teacher.updateMany(
      {},
      { $set: { password: 'qwerty' } }
    );

    // Update ALL students to have password
    const studentResult = await Student.updateMany(
      {},
      { $set: { password: 'qwerty' } }
    );

    // Update specific teacher
    await Teacher.findOneAndUpdate(
      { email: 'ja8886288@gmail.com' },
      { $set: { password: 'qwerty' } }
    );

    // Get sample data
    const sampleTeachers = await Teacher.find({}).select('name email employeeId').limit(3);
    const sampleStudents = await Student.find({}).select('name email studentId section').limit(3);

    return NextResponse.json({
      success: true,
      message: 'Passwords added successfully',
      results: {
        teachersUpdated: teacherResult.modifiedCount,
        studentsUpdated: studentResult.modifiedCount,
        sampleTeachers,
        sampleStudents
      }
    });

  } catch (error) {
    console.error('Error adding passwords:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add passwords' },
      { status: 500 }
    );
  }
}