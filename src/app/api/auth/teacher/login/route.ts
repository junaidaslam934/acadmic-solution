import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import { signToken, createAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { teacherLoginSchema, validateBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { data, error } = validateBody(teacherLoginSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const trimmedId = data!.teacherId;

    // Validate if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      return apiError('Invalid Teacher ID format', { status: 400 });
    }

    const teacher = await Teacher.findById(trimmedId).lean();

    if (!teacher) {
      return apiError('Teacher not found', { status: 404 });
    }

    // Issue JWT token
    const token = signToken({
      userId: teacher._id.toString(),
      role: 'teacher',
      name: teacher.name,
      email: teacher.email,
    });

    return apiSuccess(
      {
        message: 'Login successful',
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          employeeId: teacher.employeeId,
        },
        token,
      },
      {
        headers: { 'Set-Cookie': createAuthCookie(token) },
      }
    );
  } catch (error) {
    console.error('Teacher login error:', error);
    return apiError('An error occurred during login', { status: 500 });
  }
}
