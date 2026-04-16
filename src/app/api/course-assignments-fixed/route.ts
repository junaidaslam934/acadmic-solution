import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import CourseAssignment from '@/models/CourseAssignment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Looking for assignments for teacher:', teacherId);
    
    // Build query to handle both old and new records
    const query = {
      $and: [
        {
          $or: [
            { isActive: true },
            { isActive: { $exists: false } }
          ]
        },
        {
          $or: [
            { teacherId: teacherId },
            { teacherId: new mongoose.Types.ObjectId(teacherId) }
          ]
        }
      ]
    };
    
    // Get raw assignments first
    const rawAssignments = await CourseAssignment.find(query).sort({ year: 1, semester: 1 });
    console.log('Found raw assignments:', rawAssignments.length);
    
    if (rawAssignments.length === 0) {
      return NextResponse.json({ success: true, assignments: [] });
    }
    
    // Process each assignment and fetch course data from allcourses
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const coursesCollection = db.collection('allcourses');
    const formattedAssignments = [];
    
    for (const assignment of rawAssignments) {
      try {
        // Get course data from allcourses collection
        const courseId = assignment.courseId;
        let courseData = null;
        
        if (courseId) {
          if (mongoose.Types.ObjectId.isValid(courseId.toString())) {
            courseData = await coursesCollection.findOne({ 
              _id: new mongoose.Types.ObjectId(courseId.toString()) 
            });
          }
        }
        
        console.log(`Course ${courseId}: ${courseData ? 'Found' : 'Not found'}`);
        
        const formattedAssignment = {
          _id: assignment._id,
          teacherId: assignment.teacherId,
          courseId: {
            _id: courseId,
            courseCode: courseData?.courseCode || courseData?.code || `MISSING-${courseId.toString().slice(-8)}`,
            courseName: courseData?.courseName || courseData?.name || `Course not found (ID: ${courseId})`,
            credits: courseData?.totalCreditHours || courseData?.credits || 3,
          },
          year: assignment.year,
          semester: assignment.semester,
          isPreferred: assignment.isPreferred || false,
          creditHours: assignment.creditHours || 3,
          teachingRole: assignment.teachingRole || 'primary',
          responsibilities: assignment.responsibilities || [],
        };
        
        formattedAssignments.push(formattedAssignment);
      } catch (error) {
        console.error('Error processing assignment:', assignment._id, error);
        // Continue with next assignment even if this one fails
      }
    }
    
    console.log('Returning formatted assignments:', formattedAssignments.length);
    return NextResponse.json({ success: true, assignments: formattedAssignments });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}