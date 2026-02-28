import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, createAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return apiError('Email and password are required', { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return apiError('Invalid email or password', { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return apiError('Invalid email or password', { status: 401 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return apiSuccess(
      {
        message: 'Login successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          advisorYear: user.advisorYear || null,
          teacherId: user.teacherId?.toString() || null,
        },
        token,
      },
      { headers: { 'Set-Cookie': createAuthCookie(token) } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return apiError('An error occurred during login', { status: 500 });
  }
}
