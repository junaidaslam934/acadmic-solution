import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

// GET /api/chat/messages?conversationId=xxx - Get message history
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!conversationId || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID and User ID are required'
      }, { status: 400 });
    }

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({
        success: false,
        message: 'Conversation not found'
      }, { status: 404 });
    }

    const isParticipant = 
      conversation.participants.student.toString() === userId ||
      conversation.participants.teacher.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to messages'
      }, { status: 403 });
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });

  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages'
    }, { status: 500 });
  }
}

// POST /api/chat/messages - Send new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { conversationId, senderId, senderRole, text } = await request.json();
    
    if (!conversationId || !senderId || !senderRole || !text?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json({
        success: false,
        message: 'Conversation not found'
      }, { status: 404 });
    }

    const isParticipant = 
      conversation.participants.student.toString() === senderId ||
      conversation.participants.teacher.toString() === senderId;

    if (!isParticipant) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to send message'
      }, { status: 403 });
    }

    // Create new message
    const message = new Message({
      conversationId,
      senderId,
      senderRole,
      text: text.trim(),
      readBy: [{
        userId: senderId,
        readAt: new Date()
      }]
    });

    await message.save();

    // Update conversation with last message and unread count
    const recipientRole = senderRole === 'student' ? 'teacher' : 'student';
    const updateData: any = {
      lastMessage: {
        text: text.trim(),
        senderId,
        timestamp: message.createdAt
      },
      updatedAt: new Date()
    };

    // Increment unread count for recipient
    updateData[`unreadCount.${recipientRole}`] = conversation.unreadCount[recipientRole] + 1;

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message'
    }, { status: 500 });
  }
}