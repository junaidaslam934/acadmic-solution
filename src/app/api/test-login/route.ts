// @ts-nocheck
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

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();
    
    console.log('🔍 Test login attempt:', { email, password, role });
    
    await connectDB();
    console.log('✅ Connected to DB');

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ 
        $or: [
          { email: email },
          { employeeId: email }
        ]
      });
      
      console.log('👨‍🏫 Teacher search result:', teacher);
      
      if (teacher) {
        console.log('🔑 Password check:', {
          provided: password,
          stored: teacher.password,
          isQwerty: password === 'qwerty',
          isMatch: password === teacher.password
        });
      }
      
      return NextResponse.json({
        success: true,
        found: !!teacher,
        teacher: teacher ? {
          id: teacher._id,
          email: teacher.email,
          name: teacher.name,
          employeeId: teacher.employeeId,
          hasPassword: !!teacher.password,
          password: teacher.password
        } : null,
        passwordMatch: teacher && (password === 'qwerty' || password === teacher.password)
      });
    }
    
    return NextResponse.json({ success: false, error: 'Only teacher test supported' });
    
  } catch (error: any) {
    console.error('❌ Test login error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}