import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/lib/api-response';

// GET /api/users/[id] — Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id)
      .select('-passwordHash -resetToken -resetTokenExpiry')
      .lean();

    if (!user) {
      return apiError('User not found', { status: 404 });
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return apiError('Failed to fetch user', { status: 500 });
  }
}

// PUT /api/users/[id] — Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name, role, advisorYear, isActive, password } = body;

    const user = await User.findById(id);
    if (!user) {
      return apiError('User not found', { status: 404 });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (advisorYear !== undefined) user.advisorYear = advisorYear;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 12);
    }

    await user.save();

    return apiSuccess({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        advisorYear: user.advisorYear,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return apiError('Failed to update user', { status: 500 });
  }
}

// DELETE /api/users/[id] — Deactivate user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id);

    if (!user) {
      return apiError('User not found', { status: 404 });
    }

    user.isActive = false;
    await user.save();

    return apiSuccess({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return apiError('Failed to deactivate user', { status: 500 });
  }
}
