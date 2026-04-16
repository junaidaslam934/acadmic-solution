import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SessionalMarks from '@/models/SessionalMarks';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await connectDB();

    // Get all sessional marks for the student
    const sessionalMarks = await SessionalMarks.find({ 
      studentId: params.studentId 
    }).sort({ year: 1, semester: 1 });

    // Get course details for each mark
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const coursesCollection = db.collection('allcourses');
    
    const marksWithCourses = await Promise.all(
      sessionalMarks.map(async (mark) => {
        let course = null;
        
        try {
          if (mongoose.Types.ObjectId.isValid(mark.courseId)) {
            course = await coursesCollection.findOne({ 
              _id: new mongoose.Types.ObjectId(mark.courseId) 
            });
          }
          
          if (!course) {
            course = await coursesCollection.findOne({ _id: mark.courseId });
          }
        } catch (err) {
          console.error('Error finding course:', err);
        }

        return {
          ...mark.toObject(),
          course: course ? {
            _id: course._id,
            courseCode: course.courseCode || 'N/A',
            courseName: course.courseName || 'N/A'
          } : {
            _id: mark.courseId,
            courseCode: 'N/A',
            courseName: 'N/A'
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      marks: marksWithCourses
    });

  } catch (error) {
    console.error('Error fetching student sessional marks:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch marks'
    }, { status: 500 });
  }
}