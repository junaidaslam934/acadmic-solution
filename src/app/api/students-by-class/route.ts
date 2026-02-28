import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const section = searchParams.get('section');
    
    if (!year || !section) {
      return NextResponse.json(
        { success: false, error: 'Year and section required' },
        { status: 400 }
      );
    }
    
    const students = await Student.find({
      year: parseInt(year),
      section: section,
      isActive: true,
    }).sort({ rollNumber: 1 });
    
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
