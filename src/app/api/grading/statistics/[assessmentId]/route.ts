import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';
import Assessment from '@/models/Assessment';
import Student from '@/models/Student';

export async function GET(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json({
        success: false,
        message: 'Teacher ID is required'
      }, { status: 400 });
    }

    // Verify teacher owns this assessment
    const assessment = await Assessment.findOne({
      _id: params.assessmentId,
      teacherId: teacherId
    }).populate('courseId');

    if (!assessment) {
      return NextResponse.json({
        success: false,
        message: 'Assessment not found or access denied'
      }, { status: 404 });
    }

    // Get all grades for this assessment
    const grades = await Grade.find({
      assessmentId: params.assessmentId
    }).lean();

    // Get total students for this course/year
    const totalStudents = await Student.countDocuments({
      year: (assessment.courseId as any).year,
      isActive: true
    });

    if (grades.length === 0) {
      return NextResponse.json({
        success: true,
        statistics: {
          assessmentId: params.assessmentId,
          totalStudents,
          gradedStudents: 0,
          averageMarks: 0,
          averagePercentage: 0,
          highestMarks: 0,
          lowestMarks: 0,
          passCount: 0,
          failCount: 0,
          gradeDistribution: {
            'A': 0,
            'B': 0,
            'C': 0,
            'D': 0,
            'F': 0
          }
        }
      });
    }

    // Calculate statistics
    const marks = grades.map(g => g.marksObtained);
    const percentages = grades.map(g => (g.marksObtained / g.totalMarks) * 100);
    
    const averageMarks = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
    const averagePercentage = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;
    const highestMarks = Math.max(...marks);
    const lowestMarks = Math.min(...marks);
    
    const passCount = percentages.filter(pct => pct >= 50).length;
    const failCount = percentages.filter(pct => pct < 50).length;

    // Grade distribution
    const gradeDistribution = {
      'A': percentages.filter(pct => pct >= 90).length,
      'B': percentages.filter(pct => pct >= 80 && pct < 90).length,
      'C': percentages.filter(pct => pct >= 70 && pct < 80).length,
      'D': percentages.filter(pct => pct >= 60 && pct < 70).length,
      'F': percentages.filter(pct => pct < 60).length
    };

    return NextResponse.json({
      success: true,
      statistics: {
        assessmentId: params.assessmentId,
        totalStudents,
        gradedStudents: grades.length,
        averageMarks: Math.round(averageMarks * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        highestMarks,
        lowestMarks,
        passCount,
        failCount,
        gradeDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}