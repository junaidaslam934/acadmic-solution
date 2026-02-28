import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('Admin login endpoint called');
    await connectDB();

    const body = await request.json();
    const { key } = body;

    console.log('Admin key received:', key);

    if (!key) {
      return NextResponse.json(
        { success: false, message: 'Key is required' },
        { status: 400 }
      );
    }

    // Query the admin collection directly
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const collection = db.collection('admin');
    
    // Build the query based on key type
    let query: any = {};
    
    if (typeof key === 'string') {
      query['key.keys'] = key;
      console.log('Searching for key.keys =', key);
    } else if (typeof key === 'object' && key.keys) {
      query['key.keys'] = key.keys;
      console.log('Searching for key.keys =', key.keys);
    }

    console.log('Query:', query);
    
    const admin = await collection.findOne(query);

    if (!admin) {
      console.log('Admin not found with key:', key);
      return NextResponse.json(
        { success: false, message: 'Invalid key' },
        { status: 404 }
      );
    }

    console.log('Admin found:', admin._id);

    // Update last login time
    await collection.updateOne(
      { _id: admin._id },
      { $set: { lastLoginAt: new Date() } }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        admin: {
          id: admin._id.toString(),
          email: admin.email || '',
          name: admin.name || 'Admin',
          role: admin.role || 'admin',
          permissions: admin.permissions || [],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
