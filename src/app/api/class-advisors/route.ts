import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ClassAdvisor from '@/models/ClassAdvisor';
import Teacher from '@/models/Teacher';

// GET - Fetch all class advisors
export async function GET() {
  try {
    await connectDB();

    const advisors = await ClassAdvisor.find()
      .populate('teacherId', 'name email employeeId')
      .sort({ year: 1 });

    return NextResponse.json({
      success: true,
      data: advisors,
    });
  } catch (error) {
    console.error('Error fetching class advisors:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch class advisors',
    }, { status: 500 });
  }
}

// POST - Assign a teacher as class advisor
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { teacherId, year } = body;

    // Validate required fields
    if (!teacherId || !year) {
      return NextResponse.json(
        { success: false, message: 'Teacher ID and year are required' },
        { status: 400 }
      );
    }

    // Validate year
    if (year < 1 || year > 4) {
      return NextResponse.json(
        { success: false, message: 'Year must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check if this teacher is already assigned to another year
    const teacherAlreadyAssigned = await ClassAdvisor.findOne({ 
      teacherId, 
      year: { $ne: year } 
    });
    
    if (teacherAlreadyAssigned) {
      return NextResponse.json(
        { 
          success: false, 
          message: `This teacher is already assigned as class advisor for Year ${teacherAlreadyAssigned.year}` 
        },
        { status: 400 }
      );
    }

    // Check if advisor already exists for this year
    const existingAdvisor = await ClassAdvisor.findOne({ year });
    
    if (existingAdvisor) {
      // Update existing advisor
      existingAdvisor.teacherId = teacherId;
      await existingAdvisor.save();
      
      const populated = await ClassAdvisor.findById(existingAdvisor._id)
        .populate('teacherId', 'name email employeeId');

      return NextResponse.json({
        success: true,
        message: `Class advisor for Year ${year} updated successfully`,
        data: populated,
      });
    } else {
      // Create new advisor
      const newAdvisor = await ClassAdvisor.create({
        teacherId,
        year,
      });

      const populated = await ClassAdvisor.findById(newAdvisor._id)
        .populate('teacherId', 'name email employeeId');

      return NextResponse.json({
        success: true,
        message: `Class advisor for Year ${year} assigned successfully`,
        data: populated,
      });
    }
  } catch (error) {
    console.error('Error assigning class advisor:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to assign class advisor',
    }, { status: 500 });
  }
}

// DELETE - Remove a class advisor
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    if (!year) {
      return NextResponse.json(
        { success: false, message: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const deleted = await ClassAdvisor.findOneAndDelete({ year: parseInt(year) });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Class advisor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Class advisor for Year ${year} removed successfully`,
    });
  } catch (error) {
    console.error('Error removing class advisor:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to remove class advisor',
    }, { status: 500 });
  }
}
