import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Teacher from '@/models/Teacher';
import { apiSuccess, apiError } from '@/lib/api-response';

// GET /api/users — List all users (with pagination & filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (isActive !== null && isActive !== '') filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -resetToken -resetTokenExpiry')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return apiSuccess({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return apiError('Failed to fetch users', { status: 500 });
  }
}

// POST /api/users — Create a new user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password, name, role, advisorYear, specialization, employeeId } = body;

    if (!email || !password || !name || !role) {
      return apiError('Email, password, name, and role are required', { status: 400 });
    }

    const validRoles = ['admin', 'chairman', 'co_chairman', 'ug_coordinator', 'class_advisor', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      return apiError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, { status: 400 });
    }

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return apiError('A user with this email already exists', { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // For teacher-type roles, also create a Teacher profile
    let teacherId: mongoose.Types.ObjectId | undefined = undefined;
    if (['teacher', 'class_advisor', 'chairman', 'co_chairman', 'ug_coordinator'].includes(role)) {
      const teacher = await Teacher.create({
        email: email.toLowerCase(),
        name,
        employeeId: employeeId || `EMP-${Date.now()}`,
        specialization: specialization || [],
        isActive: true,
      });
      teacherId = teacher._id as mongoose.Types.ObjectId;
    }

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: role as 'admin' | 'chairman' | 'co_chairman' | 'ug_coordinator' | 'class_advisor' | 'teacher' | 'student',
      teacherId,
      advisorYear: role === 'class_advisor' && advisorYear ? (advisorYear as 1 | 2 | 3 | 4) : undefined,
      isActive: true,
    });

    return apiSuccess(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          advisorYear: user.advisorYear,
          teacherId: user.teacherId?.toString(),
          isActive: user.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      return apiError('A user with this email or employee ID already exists', { status: 409 });
    }
    return apiError('Failed to create user', { status: 500 });
  }
}
