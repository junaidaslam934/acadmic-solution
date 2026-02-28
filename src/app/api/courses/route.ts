import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createCourseSchema, validateBody } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    let courses: any[] = [];
    const db = mongoose.connection.db;

    if (db) {
      // Check the raw 'allcourses' collection first (where courses are actually stored)
      const collection = db.collection('allcourses');
      const allCoursesFilter = year ? { year: parseInt(year) } : {};
      courses = await collection
        .find(allCoursesFilter)
        .sort({ year: 1, semester: 1, courseCode: 1 })
        .toArray();
    }

    // Fallback to Mongoose Course model
    if (courses.length === 0) {
      const filter = year ? { year: parseInt(year) } : {};
      courses = await Course.find(filter)
        .sort({ year: 1, semester: 1, courseCode: 1 })
        .lean();
    }

    return apiSuccess({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return apiError('Error fetching courses', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { data, error } = validateBody(createCourseSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    const course = await Course.create(data!);

    return apiSuccess(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating course:', error);
    if (error.code === 11000) {
      return apiError('Course code already exists', { status: 400 });
    }
    return apiError('Error creating course', { status: 500 });
  }
}
