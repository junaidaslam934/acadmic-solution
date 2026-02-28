import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';
import Teacher from '@/models/Teacher';
import Course from '@/models/Course';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const semesterId = searchParams.get('semesterId');
    const year = searchParams.get('year');
    const outlineStatus = searchParams.get('outlineStatus');

    const filter: Record<string, unknown> = {};
    if (teacherId) filter.teacherId = teacherId;
    if (semesterId) filter.semesterId = semesterId;
    if (year) filter.year = parseInt(year);
    if (outlineStatus) filter.outlineStatus = outlineStatus;

    const assignments = await CourseAssignment.find(filter)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName credits abbreviation type')
      .populate('semesterId', 'name status academicYear')
      .sort({ year: 1, semester: 1 })
      .lean();

    // Enrich assignments whose courseId didn't populate (course lives in allcourses collection)
    const db = mongoose.connection.db;
    if (db) {
      const unpopulated = assignments.filter(
        (a: Record<string, unknown>) =>
          a.courseId && (typeof a.courseId === 'string' || (a.courseId && typeof a.courseId === 'object' && !('courseCode' in (a.courseId as Record<string, unknown>))))
      );
      if (unpopulated.length > 0) {
        const ids = unpopulated.map((a: Record<string, unknown>) => {
          const id = typeof a.courseId === 'string' ? a.courseId : String((a.courseId as Record<string, unknown>)._id || a.courseId);
          try { return new mongoose.Types.ObjectId(id); } catch { return null; }
        }).filter(Boolean);
        if (ids.length > 0) {
          const rawCourses = await db.collection('allcourses').find({ _id: { $in: ids } }).toArray();
          const courseMap = new Map(rawCourses.map(c => [String(c._id), c]));
          for (const a of unpopulated) {
            const id = typeof a.courseId === 'string' ? a.courseId : String((a.courseId as Record<string, unknown>)._id || a.courseId);
            const raw = courseMap.get(id);
            if (raw) {
              (a as Record<string, unknown>).courseId = {
                _id: raw._id,
                courseCode: raw.courseCode,
                courseName: raw.courseName,
                credits: raw.credits,
                abbreviation: raw.abbreviation,
                type: raw.type,
              };
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, data: assignments, assignments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching assignments:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { teacherId, courseId, semesterId, year, semester, sections, isShared, creditHoursAssigned } = body;

    if (!teacherId || !courseId || !year || !semester) {
      return NextResponse.json(
        { success: false, error: 'teacherId, courseId, year, and semester are required' },
        { status: 400 }
      );
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      // Fallback: check the raw 'allcourses' collection (where courses are actually stored)
      const db = mongoose.connection.db;
      if (db) {
        let rawCourse = null;
        try {
          rawCourse = await db.collection('allcourses').findOne({
            _id: new mongoose.Types.ObjectId(courseId),
          });
        } catch {
          // courseId may not be a valid ObjectId
        }
        if (!rawCourse) {
          return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
      }
    }

    const assignmentData: Record<string, unknown> = {
      teacherId,
      courseId,
      year,
      semester,
      outlineStatus: 'pending',
    };
    if (semesterId) assignmentData.semesterId = semesterId;
    if (sections) assignmentData.sections = sections;
    if (isShared !== undefined) assignmentData.isShared = isShared;
    if (creditHoursAssigned) assignmentData.creditHoursAssigned = creditHoursAssigned;

    const assignment = await CourseAssignment.findOneAndUpdate(
      { teacherId, courseId, year, semester, ...(semesterId ? { semesterId } : {}) },
      assignmentData,
      { upsert: true, new: true }
    );

    const populated = await CourseAssignment.findById(assignment._id)
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName credits')
      .lean();

    // If courseId wasn't populated (course is in allcourses, not courses), enrich manually
    if (populated && populated.courseId && typeof populated.courseId === 'string' || (populated?.courseId && !('courseCode' in (populated.courseId as Record<string, unknown>)))) {
      const db = mongoose.connection.db;
      if (db) {
        try {
          const rawCourse = await db.collection('allcourses').findOne({
            _id: new mongoose.Types.ObjectId(String(assignment.courseId)),
          });
          if (rawCourse) {
            (populated as Record<string, unknown>).courseId = {
              _id: rawCourse._id,
              courseCode: rawCourse.courseCode,
              courseName: rawCourse.courseName,
              credits: rawCourse.credits,
            };
          }
        } catch {
          // ignore enrichment errors
        }
      }
    }

    return NextResponse.json({ success: true, data: populated, assignment: populated }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating assignment:', message);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Assignment _id required' }, { status: 400 });
    }

    const assignment = await CourseAssignment.findByIdAndUpdate(_id, updates, { new: true })
      .populate('teacherId', 'name email employeeId')
      .populate('courseId', 'courseCode courseName credits')
      .lean();

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Assignment ID required' }, { status: 400 });
    }

    await CourseAssignment.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Assignment deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
