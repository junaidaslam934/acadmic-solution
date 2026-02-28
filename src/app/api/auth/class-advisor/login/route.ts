import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import ClassAdvisor from '@/models/ClassAdvisor';
import { signToken, createAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { classAdvisorLoginSchema, validateBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { data, error } = validateBody(classAdvisorLoginSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const trimmedId = data!.advisorId;

    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
      return apiError('Invalid Class Advisor ID format', { status: 400 });
    }

    const advisor = await ClassAdvisor.findById(trimmedId).populate('teacherId');

    if (!advisor) {
      return apiError('Class Advisor not found', { status: 404 });
    }

    const teacher = advisor.teacherId as any;

    if (!teacher) {
      return apiError('Teacher information not found', { status: 404 });
    }

    // Issue JWT token
    const token = signToken({
      userId: advisor._id.toString(),
      role: 'class_advisor',
      name: teacher.name,
      email: teacher.email,
    });

    return apiSuccess(
      {
        message: 'Login successful',
        advisor: {
          id: advisor._id,
          teacherId: teacher._id,
          teacherName: teacher.name,
          teacherEmail: teacher.email,
          year: advisor.year,
        },
        token,
      },
      {
        headers: { 'Set-Cookie': createAuthCookie(token) },
      }
    );
  } catch (error) {
    console.error('Class advisor login error:', error);
    return apiError('An error occurred during login', { status: 500 });
  }
}
