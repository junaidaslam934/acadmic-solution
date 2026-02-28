import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { signToken, createAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { adminLoginSchema, validateBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { data, error } = validateBody(adminLoginSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const key = typeof data!.key === 'string' ? data!.key : data!.key.keys;

    // Query the admin collection directly
    const db = mongoose.connection.db;
    if (!db) {
      return apiError('Database connection failed', { status: 500 });
    }

    const collection = db.collection('admin');
    const admin = await collection.findOne({ 'key.keys': key });

    if (!admin) {
      return apiError('Invalid key', { status: 401 });
    }

    // Update last login time
    await collection.updateOne(
      { _id: admin._id },
      { $set: { lastLoginAt: new Date() } }
    );

    // Issue JWT token
    const token = signToken({
      userId: admin._id.toString(),
      role: 'admin',
      name: admin.name || 'Admin',
      email: admin.email || '',
    });

    return apiSuccess(
      {
        message: 'Login successful',
        admin: {
          id: admin._id.toString(),
          email: admin.email || '',
          name: admin.name || 'Admin',
          role: admin.role || 'admin',
          permissions: admin.permissions || [],
        },
        token,
      },
      {
        headers: { 'Set-Cookie': createAuthCookie(token) },
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return apiError('An error occurred during login', { status: 500 });
  }
}
