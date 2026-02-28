import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Semester from '@/models/Semester';
import { apiSuccess, apiError } from '@/lib/api-response';

// GET /api/semesters — List all semesters
export async function GET() {
  try {
    await connectDB();
    const semesters = await Semester.find()
      .populate('classAdvisors.userId', 'name email role')
      .populate('ugCoordinatorId', 'name email')
      .populate('coChairmanId', 'name email')
      .populate('chairmanId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess({ semesters });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return apiError('Failed to fetch semesters', { status: 500 });
  }
}

// POST /api/semesters — Create a new semester
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { academicYear, type, startDate, endDate, sections, timeSlots, workingDays, outlineDeadline, schedulingDeadline } = body;

    if (!academicYear || !type || !startDate || !endDate) {
      return apiError('Academic year, type, start date, and end date are required', { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return apiError('Start date must be before end date', { status: 400 });
    }

    // Auto-generate name from type + academic year (e.g. "Fall 2025-2026")
    const name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${academicYear}`;

    const semester = await Semester.create({
      name,
      academicYear,
      type,
      startDate: start,
      endDate: end,
      status: 'active',
      sections: sections || { 1: ['A', 'B'], 2: ['A', 'B'], 3: ['A', 'B'], 4: ['A', 'B'] },
      timeSlots: timeSlots || undefined,
      workingDays: workingDays || undefined,
      outlineDeadline: outlineDeadline ? new Date(outlineDeadline) : undefined,
      schedulingDeadline: schedulingDeadline ? new Date(schedulingDeadline) : undefined,
    });

    return apiSuccess({ semester }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating semester:', error);
    if (error.code === 11000) {
      return apiError('A semester with this name already exists', { status: 409 });
    }
    return apiError('Failed to create semester', { status: 500 });
  }
}

// PUT /api/semesters — Update a semester
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, id, ...updates } = body;
    const semesterId = _id || id;

    if (!semesterId) {
      return apiError('Semester ID is required', { status: 400 });
    }

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.outlineDeadline) updates.outlineDeadline = new Date(updates.outlineDeadline);
    if (updates.schedulingDeadline) updates.schedulingDeadline = new Date(updates.schedulingDeadline);

    // Auto-regenerate name if type or academicYear changes
    if (updates.type || updates.academicYear) {
      const existing = await Semester.findById(semesterId);
      if (existing) {
        const newType = updates.type || existing.type;
        const newYear = updates.academicYear || existing.academicYear;
        updates.name = `${newType.charAt(0).toUpperCase() + newType.slice(1)} ${newYear}`;
      }
    }

    const semester = await Semester.findByIdAndUpdate(semesterId, updates, { new: true })
      .populate('classAdvisors.userId', 'name email role')
      .populate('ugCoordinatorId', 'name email')
      .populate('coChairmanId', 'name email')
      .populate('chairmanId', 'name email');

    if (!semester) {
      return apiError('Semester not found', { status: 404 });
    }

    return apiSuccess({ semester });
  } catch (error) {
    console.error('Error updating semester:', error);
    return apiError('Failed to update semester', { status: 500 });
  }
}

// DELETE /api/semesters — Delete a semester
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Semester ID is required', { status: 400 });
    }

    const semester = await Semester.findById(id);
    if (!semester) {
      return apiError('Semester not found', { status: 404 });
    }
    if (semester.status !== 'planning') {
      return apiError('Only semesters in planning status can be deleted', { status: 400 });
    }

    await Semester.findByIdAndDelete(id);
    return apiSuccess({ message: 'Semester deleted' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return apiError('Failed to delete semester', { status: 500 });
  }
}
