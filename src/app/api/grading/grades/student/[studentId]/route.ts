import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    await connectDB();
    const { studentId } = await context.params;

    // Get all grades for the student
    const grades = await Grade.find({ 
      studentId: studentId 
    })
    .populate({
      path: 'assessmentId',
      select: 'name type totalMarks courseId',
      populate: {
        path: 'courseId',
        select: 'courseCode courseName'
      }
    })
    .sort({ gradedAt: -1 })
    .lean();

    // Calculate percentage for each grade
    const gradesWithPercentage = grades.map(grade => ({
      ...grade,
      percentage: (grade.marksObtained / grade.totalMarks) * 100
    }));

    return NextResponse.json({
      success: true,
      grades: gradesWithPercentage
    });

  } catch (error: any) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch grades'
    }, { status: 500 });
  }
}