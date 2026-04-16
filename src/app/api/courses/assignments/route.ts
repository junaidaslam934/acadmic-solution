import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Course from '@/models/Course';
import Teacher from '@/models/Teacher';

// GET: Fetch course assignments with teacher details
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const teacherId = searchParams.get('teacherId');
    const year = searchParams.get('year');
    const semester = searchParams.get('semester');

    let query: any = { isActive: true };

    if (courseId) query.courseId = courseId;
    if (teacherId) query.teacherId = teacherId;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);

    const assignments = await CourseAssignment.find(query)
      .populate('teacherId', 'name email employeeId specialization')
      .populate('courseId', 'courseCode courseName totalCreditHours department')
      .sort({ createdAt: -1 });

    // Group assignments by course to show multi-teacher courses
    const courseGroups = assignments.reduce((acc: any, assignment: any) => {
      const courseKey = `${assignment.courseId._id}_${assignment.year}_${assignment.semester}`;
      
      if (!acc[courseKey]) {
        acc[courseKey] = {
          course: assignment.courseId,
          year: assignment.year,
          semester: assignment.semester,
          teachers: [],
          totalAssignedHours: 0,
        };
      }
      
      acc[courseKey].teachers.push({
        teacher: assignment.teacherId,
        creditHours: assignment.creditHours,
        teachingRole: assignment.teachingRole,
        responsibilities: assignment.responsibilities,
        isPreferred: assignment.isPreferred,
        assignmentId: assignment._id,
      });
      
      acc[courseKey].totalAssignedHours += assignment.creditHours;
      
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      assignments: Object.values(courseGroups),
    });

  } catch (error) {
    console.error('Error fetching course assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course assignments' },
      { status: 500 }
    );
  }
}

// POST: Create new course assignment
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      teacherId,
      courseId,
      year,
      semester,
      creditHours,
      teachingRole,
      responsibilities,
      isPreferred,
      assignedBy
    } = await request.json();

    // Validate that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check current assignments for this course
    const existingAssignments = await CourseAssignment.find({
      courseId,
      year,
      semester,
      isActive: true
    });

    // Calculate total assigned credit hours
    const totalAssigned = existingAssignments.reduce(
      (sum, assignment) => sum + assignment.creditHours, 
      0
    );

    // Validate that total assigned hours don't exceed course credit hours
    if (totalAssigned + creditHours > course.totalCreditHours) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot assign ${creditHours} hours. Course has ${course.totalCreditHours} total hours, ${totalAssigned} already assigned. Only ${course.totalCreditHours - totalAssigned} hours available.`
        },
        { status: 400 }
      );
    }

    // Check if teacher-course-role combination already exists
    const existingAssignment = await CourseAssignment.findOne({
      teacherId,
      courseId,
      year,
      semester,
      teachingRole,
      isActive: true
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Teacher already assigned to this course with this role' },
        { status: 400 }
      );
    }

    // Create new assignment
    const assignment = new CourseAssignment({
      teacherId,
      courseId,
      year,
      semester,
      creditHours,
      teachingRole,
      responsibilities: responsibilities || [],
      isPreferred: isPreferred || false,
      assignedBy,
      isActive: true
    });

    await assignment.save();

    // Populate the response
    await assignment.populate('teacherId', 'name email employeeId');
    await assignment.populate('courseId', 'courseCode courseName totalCreditHours');

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Course assignment created successfully'
    });

  } catch (error) {
    console.error('Error creating course assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course assignment' },
      { status: 500 }
    );
  }
}

// PUT: Update existing course assignment
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const {
      assignmentId,
      creditHours,
      teachingRole,
      responsibilities,
      isPreferred
    } = await request.json();

    const assignment = await CourseAssignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // If credit hours are being changed, validate total doesn't exceed course limit
    if (creditHours && creditHours !== assignment.creditHours) {
      const course = await Course.findById(assignment.courseId);
      const otherAssignments = await CourseAssignment.find({
        courseId: assignment.courseId,
        year: assignment.year,
        semester: assignment.semester,
        _id: { $ne: assignmentId },
        isActive: true
      });

      const otherAssignedHours = otherAssignments.reduce(
        (sum, a) => sum + a.creditHours, 
        0
      );

      if (otherAssignedHours + creditHours > course.totalCreditHours) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot assign ${creditHours} hours. Total would exceed course limit of ${course.totalCreditHours} hours.`
          },
          { status: 400 }
        );
      }
    }

    // Update assignment
    if (creditHours) assignment.creditHours = creditHours;
    if (teachingRole) assignment.teachingRole = teachingRole;
    if (responsibilities) assignment.responsibilities = responsibilities;
    if (isPreferred !== undefined) assignment.isPreferred = isPreferred;

    await assignment.save();

    return NextResponse.json({
      success: true,
      assignment,
      message: 'Assignment updated successfully'
    });

  } catch (error) {
    console.error('Error updating course assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course assignment' },
      { status: 500 }
    );
  }
}