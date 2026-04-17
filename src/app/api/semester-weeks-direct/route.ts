import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const db = mongoose.connection.db!;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    // Get weeks directly from semesterweeks collection
    const weeksCollection = db.collection('semesterweeks');
    const weeks = await weeksCollection.find({}).sort({ weekNumber: 1 }).toArray();
    
    console.log('Found weeks directly from semesterweeks:', weeks.length);
    
    return NextResponse.json({
      success: true,
      weeks: weeks
    });
    
  } catch (error: any) {
    console.error('Error fetching weeks directly:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}