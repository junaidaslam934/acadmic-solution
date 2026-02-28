import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TeacherPreference from '@/models/TeacherPreference';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    const filter = teacherId ? { teacherId } : {};
    const preferences = await TeacherPreference.find(filter)
      .populate('teacherId', 'name email department')
      .populate('courseId', 'courseCode courseName year semester')
      .sort({ preferenceLevel: 1 });
    
    return NextResponse.json({ success: true, preferences });
  } catch (error: any) {
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
    
    const preference = await TeacherPreference.findOneAndUpdate(
      { teacherId: body.teacherId, courseId: body.courseId },
      body,
      { upsert: true, new: true }
    ).populate('teacherId', 'name email')
     .populate('courseId', 'courseCode courseName');
    
    return NextResponse.json({ success: true, preference }, { status: 201 });
  } catch (error: any) {
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
        { success: false, error: 'Preference ID required' },
        { status: 400 }
      );
    }
    
    await TeacherPreference.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'Preference deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
