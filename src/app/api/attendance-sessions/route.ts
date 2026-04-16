import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const courseId = searchParams.get('courseId');
    const weekId = searchParams.get('weekId');
    const section = searchParams.get('section');
    
    if (!teacherId || !courseId || !weekId || !section) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Get completed attendance sessions
    const attendanceCollection = db.collection('attendances');
    const completedSessions = await attendanceCollection.find({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      courseId: new mongoose.Types.ObjectId(courseId),
      weekId: new mongoose.Types.ObjectId(weekId),
      section: section
    }).toArray();
    
    const sessions = completedSessions.map(session => ({
      sessionNumber: session.sessionNumber,
      completedAt: session.createdAt,
      attendanceId: session._id
    }));
    
    return NextResponse.json({
      success: true,
      sessions: sessions
    });
    
  } catch (error) {
    console.error('Error fetching attendance sessions:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}