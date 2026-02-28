import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coordinator from '@/models/Coordinator';
import { isValidObjectId } from 'mongoose';
import { signToken, createAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = body.identifier || body.coordinatorId;

    if (!identifier) {
      return apiError('Coordinator ID is required', { status: 400 });
    }

    if (!isValidObjectId(identifier)) {
      return apiError('Invalid Coordinator ID format', { status: 400 });
    }

    await connectDB();

    const coordinator = await Coordinator.findById(identifier).lean();

    if (!coordinator) {
      return apiError('Coordinator not found', { status: 404 });
    }

    // Issue JWT token
    const token = signToken({
      userId: coordinator._id.toString(),
      role: 'coordinator',
      name: coordinator.name,
      email: coordinator.email,
    });

    return apiSuccess(
      {
        message: 'Login successful',
        coordinator: {
          id: coordinator._id.toString(),
          name: coordinator.name,
          email: coordinator.email,
          department: coordinator.department,
        },
        token,
      },
      {
        headers: { 'Set-Cookie': createAuthCookie(token) },
      }
    );
  } catch (error) {
    console.error('Coordinator login error:', error);
    return apiError('An error occurred during login', { status: 500 });
  }
}
