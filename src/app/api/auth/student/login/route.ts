import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { signToken, createAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { studentLoginSchema, validateBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { data, error } = validateBody(studentLoginSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const { studentId } = data!;

    // Try to find student by ID (MongoDB ObjectId) or roll number
    let student = mongoose.Types.ObjectId.isValid(studentId)
      ? await Student.findById(studentId).lean()
      : null;

    if (!student) {
      student = await Student.findOne({ rollNumber: studentId }).lean();
    }

    if (!student) {
      return apiError('Student not found', { status: 404 });
    }

    if (!student.isActive) {
      return apiError('Student account is inactive', { status: 403 });
    }

    // Issue JWT token
    const token = signToken({
      userId: student._id.toString(),
      role: 'student',
      name: student.studentName,
    });

    return apiSuccess(
      {
        message: 'Login successful',
        student: {
          _id: student._id,
          studentName: student.studentName,
          rollNumber: student.rollNumber,
          year: student.year,
          section: student.section,
          coursesEnrolled: student.coursesEnrolled || [],
        },
        token,
      },
      {
        headers: { 'Set-Cookie': createAuthCookie(token) },
      }
    );
  } catch (error) {
    console.error('Student login error:', error);
    return apiError('An error occurred during login', { status: 500 });
  }
}
