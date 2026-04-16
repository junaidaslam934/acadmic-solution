import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId') || '69923c481ec2fa78e445ecfc';
    
    console.log('Debug: Looking for teacherId:', teacherId);
    
    // Test direct collection access
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Check both possible collection names
    const collections = ['courseasigned', 'courseassigned', 'assignments'];
    const results: any = {};
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        if (count > 0) {
          const allAssignments = await collection.find({}).limit(10).toArray();
          const teacherAssignments = await collection.find({ 
            teacherId: new mongoose.Types.ObjectId(teacherId)
          }).toArray();
          
          // Also search for similar teacher IDs (in case of typos)
          const similarTeacherIds = await collection.find({
            teacherId: { $regex: teacherId.substring(0, 15) }
          }).toArray();
          
          results[collectionName] = {
            totalCount: count,
            sampleAssignments: allAssignments.map(a => ({
              _id: a._id,
              teacherId: a.teacherId,
              courseId: a.courseId,
              year: a.year,
              semester: a.semester,
              isActive: a.isActive,
              isPreferred: a.isPreferred
            })),
            exactMatches: teacherAssignments.length,
            similarMatches: similarTeacherIds.length,
            similarAssignments: similarTeacherIds.map(a => ({
              _id: a._id,
              teacherId: a.teacherId,
              courseId: a.courseId
            }))
          };
        }
      } catch (error) {
        results[collectionName] = { error: `Collection ${collectionName} not found or error: ${error}` };
      }
    }
    
    return NextResponse.json({
      success: true,
      searchedTeacherId: teacherId,
      collections: results
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}