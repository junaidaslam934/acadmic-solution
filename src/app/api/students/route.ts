import { NextRequest } from 'next/server';
import Student from '@/models/Student';
import connectDB from '@/lib/mongodb';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createStudentSchema, validateBody } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const year = searchParams.get('year');
    const section = searchParams.get('section');

    const filter: Record<string, unknown> = {};
    if (year) filter.year = parseInt(year);
    if (section) filter.section = section;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ rollNumber: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return apiSuccess({
      students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return apiError('Error fetching students', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { data, error } = validateBody(createStudentSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const student = await Student.create(data!);

    return apiSuccess(
      { message: 'Student added successfully', student },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding student:', error);
    if (error.code === 11000) {
      return apiError('Roll number already exists', { status: 400 });
    }
    return apiError('Error adding student', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return apiError('Student ID is required', { status: 400 });
    }

    const deleted = await Student.findByIdAndDelete(studentId);

    if (!deleted) {
      return apiError('Student not found', { status: 404 });
    }

    return apiSuccess({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return apiError('Error deleting student', { status: 500 });
  }
}
