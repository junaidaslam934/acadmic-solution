import { NextRequest, NextResponse } from 'next/server';
import Teacher from '@/models/Teacher';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const filter = activeOnly ? { isActive: true } : {};
    const teachers = await Teacher.find(filter).sort({ name: 1 });
    
    console.log(`Fetching teachers with filter:`, filter, `Found: ${teachers.length}`);
    
    return NextResponse.json({ success: true, teachers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching teachers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, employeeId, specialization } = body;

    if (!name || !email || !employeeId) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and employee ID are required' },
        { status: 400 }
      );
    }

    const teacher = new Teacher({
      name,
      email,
      employeeId,
      specialization: specialization || [],
    });

    await teacher.save();

    return NextResponse.json(
      { success: true, message: 'Teacher added successfully', teacher },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding teacher:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, message: `${field} already exists` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error adding teacher' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('id');

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    await Teacher.findByIdAndDelete(teacherId);

    return NextResponse.json(
      { success: true, message: 'Teacher deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting teacher' },
      { status: 500 }
    );
  }
}
