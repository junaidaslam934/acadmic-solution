import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

// GET /api/chat/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');
    
    if (!userId || !userRole) {
      return NextResponse.json({
        success: false,
        message: 'User ID and role are required'
      }, { status: 400 });
    }

    let conversations;
    
    if (userRole === 'student') {
      conversations = await Conversation.find({
        'participants.student': userId
      })
      .populate('participants.teacher', 'name email')
      .sort({ updatedAt: -1 })
      .lean();
    } else if (userRole === 'teacher') {
      conversations = await Conversation.find({
        'participants.teacher': userId
      })
      .populate('participants.student', 'studentName rollNumber')
      .sort({ updatedAt: -1 })
      .lean();
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid user role'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      conversations
    });

  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch conversations'
    }, { status: 500 });
  }
}

// POST /api/chat/conversations - Create new conversation (students only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { studentId, teacherId } = await request.json();
    
    if (!studentId || !teacherId) {
      return NextResponse.json({
        success: false,
        message: 'Student ID and Teacher ID are required'
      }, { status: 400 });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      'participants.student': studentId,
      'participants.teacher': teacherId
    });

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        conversation: existingConversation
      });
    }

    // Verify student and teacher exist
    const student = await Student.findById(studentId);
    const teacher = await Teacher.findById(teacherId);

    if (!student || !teacher) {
      return NextResponse.json({
        success: false,
        message: 'Invalid student or teacher ID'
      }, { status: 400 });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: {
        student: studentId,
        teacher: teacherId
      },
      lastMessage: {
        text: '',
        senderId: null,
        timestamp: new Date()
      },
      unreadCount: {
        student: 0,
        teacher: 0
      }
    });

    await conversation.save();

    // Populate the conversation with user details
    await conversation.populate('participants.teacher', 'name email');
    await conversation.populate('participants.student', 'studentName rollNumber');

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create conversation'
    }, { status: 500 });
  }
}