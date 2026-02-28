import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Holiday from '@/models/Holiday';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semesterId');

    const filter: any = {};
    if (semesterId) filter.semesterId = semesterId;

    const holidays = await Holiday.find(filter).sort({ date: 1 });

    return NextResponse.json({ success: true, holidays });
  } catch (error: any) {
    console.error('Error fetching holidays:', error);
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
    const { semesterId, date, reason } = body;

    if (!semesterId || !date || !reason) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const holiday = new Holiday({
      semesterId,
      date: new Date(date),
      reason,
    });

    await holiday.save();

    return NextResponse.json({ success: true, holiday }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating holiday:', error);
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
        { success: false, error: 'Holiday ID is required' },
        { status: 400 }
      );
    }

    await Holiday.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Holiday deleted' });
  } catch (error: any) {
    console.error('Error deleting holiday:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
