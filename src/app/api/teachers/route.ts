import { NextRequest } from 'next/server';
import Teacher from '@/models/Teacher';
import connectDB from '@/lib/mongodb';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createTeacherSchema, validateBody } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const filter: Record<string, unknown> = {};
    if (activeOnly) filter.isActive = true;

    const [teachers, total] = await Promise.all([
      Teacher.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Teacher.countDocuments(filter),
    ]);

    return apiSuccess({
      teachers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return apiError('Error fetching teachers', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { data, error } = validateBody(createTeacherSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const teacher = await Teacher.create(data!);

    return apiSuccess(
      { message: 'Teacher added successfully', teacher },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding teacher:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return apiError(`${field} already exists`, { status: 400 });
    }
    return apiError('Error adding teacher', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('id');

    if (!teacherId) {
      return apiError('Teacher ID is required', { status: 400 });
    }

    const deleted = await Teacher.findByIdAndDelete(teacherId);

    if (!deleted) {
      return apiError('Teacher not found', { status: 404 });
    }

    return apiSuccess({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return apiError('Error deleting teacher', { status: 500 });
  }
}
