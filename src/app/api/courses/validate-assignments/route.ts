import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Course from '@/models/Course';

// GET: Validate course assignments and check for issues
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    let query: any = { isActive: true };
    if (courseId) query.courseId = courseId;

    // Get all active assignments
    const assignments = await CourseAssignment.find(query)
      .populate('courseId', 'courseCode courseName totalCreditHours')
      .populate('teacherId', 'name email employeeId');

    // Group by course and validate
    const courseValidation = assignments.reduce((acc: any, assignment: any) => {
      const courseKey = `${assignment.courseId._id}_${assignment.year}_${assignment.semester}`;
      
      if (!acc[courseKey]) {
        acc[courseKey] = {
          course: assignment.courseId,
          year: assignment.year,
          semester: assignment.semester,
          assignments: [],
          totalAssignedHours: 0,
          issues: [],
        };
      }
      
      acc[courseKey].assignments.push({
        teacher: assignment.teacherId,
        creditHours: assignment.creditHours,
        teachingRole: assignment.teachingRole,
        responsibilities: assignment.responsibilities,
      });
      
      acc[courseKey].totalAssignedHours += assignment.creditHours;
      
      return acc;
    }, {});

    // Check for validation issues
    Object.values(courseValidation).forEach((courseData: any) => {
      const { course, totalAssignedHours, assignments, issues } = courseData;
      
      // Check if total assigned hours exceed course credit hours
      if (totalAssignedHours > course.totalCreditHours) {
        issues.push({
          type: 'OVER_ASSIGNED',
          message: `Total assigned hours (${totalAssignedHours}) exceed course credit hours (${course.totalCreditHours})`
        });
      }
      
      // Check if course is under-assigned
      if (totalAssignedHours < course.totalCreditHours) {
        issues.push({
          type: 'UNDER_ASSIGNED',
          message: `Course is under-assigned. ${course.totalCreditHours - totalAssignedHours} hours remaining`
        });
      }
      
      // Check for duplicate teaching roles
      const roles = assignments.map((a: any) => a.teachingRole);
      const duplicateRoles = roles.filter((role: string, index: number) => roles.indexOf(role) !== index);
      if (duplicateRoles.length > 0) {
        issues.push({
          type: 'DUPLICATE_ROLES',
          message: `Duplicate teaching roles found: ${duplicateRoles.join(', ')}`
        });
      }
      
      // Check if course has a primary teacher
      const hasPrimary = assignments.some((a: any) => a.teachingRole === 'primary');
      if (!hasPrimary && assignments.length > 0) {
        issues.push({
          type: 'NO_PRIMARY_TEACHER',
          message: 'Course has no primary teacher assigned'
        });
      }
    });

    return NextResponse.json({
      success: true,
      validation: Object.values(courseValidation),
      summary: {
        totalCourses: Object.keys(courseValidation).length,
        coursesWithIssues: Object.values(courseValidation).filter((c: any) => c.issues.length > 0).length,
        totalIssues: Object.values(courseValidation).reduce((sum: number, c: any) => sum + c.issues.length, 0)
      }
    });

  } catch (error) {
    console.error('Error validating course assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate course assignments' },
      { status: 500 }
    );
  }
}