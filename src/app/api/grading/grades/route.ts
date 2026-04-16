import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Grade from '@/models/Grade';
import Assessment from '@/models/Assessment';
import Student from '@/models/Student';

// GET /api/grading/grades?assessmentId=xxx&section=A&teacherId=xxx - Get grades for assessment
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const section = searchParams.get('section');
    const teacherId = searchParams.get('teacherId');
    
    if (!assessmentId || !teacherId) {
      return NextResponse.json({
        success: false,
        message: 'Assessment ID and Teacher ID are required'
      }, { status: 400 });
    }

    // Verify teacher owns this assessment
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      teacherId,
      isActive: true
    }).populate('courseId');

    if (!assessment) {
      return NextResponse.json({
        success: false,
        message: 'Assessment not found or access denied'
      }, { status: 404 });
    }

    // Build student query
    const studentQuery: any = {
      year: (assessment.courseId as any).year
    };
    
    if (section) {
      studentQuery.section = section;
    }

    // Get all students for this course year/section
    const students = await Student.find(studentQuery)
      .select('studentName rollNumber section')
      .sort({ rollNumber: 1 })
      .lean();

    // Get existing grades for these students
    const studentIds = students.map(s => s._id);
    const grades = await Grade.find({
      assessmentId,
      studentId: { $in: studentIds }
    }).lean();

    // Create grade map for quick lookup
    const gradeMap = new Map();
    grades.forEach(grade => {
      gradeMap.set(grade.studentId.toString(), grade);
    });

    // Combine student data with grades
    const studentGrades = students.map(student => {
      const grade = gradeMap.get(student._id.toString());
      return {
        studentId: student._id.toString(),
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        section: student.section,
        marksObtained: grade?.marksObtained,
        percentage: grade?.percentage,
        isGraded: !!grade,
        comments: grade?.comments,
        gradedAt: grade?.gradedAt
      };
    });

    return NextResponse.json({
      success: true,
      assessment: {
        _id: assessment._id,
        name: assessment.name,
        type: assessment.type,
        totalMarks: assessment.totalMarks,
        courseId: assessment.courseId
      },
      grades: studentGrades
    });

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch grades'
    }, { status: 500 });
  }
}

// POST /api/grading/grades - Submit grades (bulk operation)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { grades } = await request.json();
    
    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Grades array is required'
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each grade
    for (const gradeData of grades) {
      try {
        const { assessmentId, studentId, marksObtained, comments } = gradeData;
        
        if (!assessmentId || !studentId || marksObtained === undefined) {
          errors.push({
            studentId,
            error: 'Missing required fields'
          });
          continue;
        }

        // Verify assessment exists
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
          errors.push({
            studentId,
            error: 'Assessment not found'
          });
          continue;
        }

        // Validate marks
        if (marksObtained < 0 || marksObtained > assessment.totalMarks) {
          errors.push({
            studentId,
            error: `Marks must be between 0 and ${assessment.totalMarks}`
          });
          continue;
        }

        // Check if grade already exists
        const existingGrade = await Grade.findOne({
          assessmentId,
          studentId
        });

        if (existingGrade) {
          // Update existing grade
          const previousValue = existingGrade.marksObtained;
          
          existingGrade.marksObtained = marksObtained;
          existingGrade.totalMarks = assessment.totalMarks;
          existingGrade.comments = comments?.trim();
          existingGrade.gradedAt = new Date();
          existingGrade.gradedBy = assessment.teacherId;
          
          // Add audit trail entry
          existingGrade.auditTrail.push({
            action: 'updated',
            performedBy: assessment.teacherId,
            performedAt: new Date(),
            previousValue,
            newValue: marksObtained
          });

          await existingGrade.save();
          results.push({ studentId, action: 'updated', grade: existingGrade });
        } else {
          // Create new grade
          const newGrade = new Grade({
            assessmentId,
            studentId,
            teacherId: assessment.teacherId,
            marksObtained,
            totalMarks: assessment.totalMarks,
            gradedBy: assessment.teacherId,
            comments: comments?.trim(),
            auditTrail: [{
              action: 'created',
              performedBy: assessment.teacherId,
              performedAt: new Date(),
              newValue: marksObtained
            }]
          });

          await newGrade.save();
          results.push({ studentId, action: 'created', grade: newGrade });
        }
      } catch (error: any) {
        errors.push({
          studentId: gradeData.studentId,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      message: `Processed ${results.length} grades successfully${errors.length > 0 ? `, ${errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('Error submitting grades:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to submit grades'
    }, { status: 500 });
  }
}