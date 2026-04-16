import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coordinator from '@/models/Coordinator';

export async function GET() {
  try {
    await connectDB();
    const coordinators = await Coordinator.find({}).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      coordinators
    });
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coordinators' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, department } = body;

    if (!name || !email || !department) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and department are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const coordinator = await Coordinator.create({
      name,
      email,
      department
    });

    return NextResponse.json({
      success: true,
      coordinator
    });
  } catch (error) {
    console.error('Error creating coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coordinator' },
      { status: 500 }
    );
  }
}
