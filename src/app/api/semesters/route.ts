import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Semester from '@/models/Semester';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const semesters = await Semester.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, semesters });
  } catch (error: any) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Name, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    const semester = new Semester({
      name,
      startDate: start,
      endDate: end,
    });

    await semester.save();

    return NextResponse.json({ success: true, semester }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating semester:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { id, name, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    const semester = await Semester.findByIdAndUpdate(
      id,
      {
        name,
        startDate: start,
        endDate: end,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!semester) {
      return NextResponse.json(
        { success: false, error: 'Semester not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, semester });
  } catch (error: any) {
    console.error('Error updating semester:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    await Semester.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Semester deleted' });
  } catch (error: any) {
    console.error('Error deleting semester:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
