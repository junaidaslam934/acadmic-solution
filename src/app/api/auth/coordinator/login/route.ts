import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coordinator from '@/models/Coordinator';
import { isValidObjectId } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Coordinator ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!isValidObjectId(identifier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Coordinator ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find coordinator by ID
    const coordinator = await Coordinator.findById(identifier);

    if (!coordinator) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coordinator: {
        id: coordinator._id.toString(),
        name: coordinator.name,
        email: coordinator.email,
        department: coordinator.department
      }
    });
  } catch (error) {
    console.error('Coordinator login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
