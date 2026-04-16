import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

// PUT /api/chat/messages/[id]/read - Mark message as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const messageId = params.id;
    const { userId, userRole } = await request.json();
    
    if (!userId || !userRole) {
      return NextResponse.json({
        success: false,
        message: 'User ID and role are required'
      }, { status: 400 });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Message not found'
      }, { status: 404 });
    }

    // Check if user already marked this message as read
    const alreadyRead = message.readBy.some(
      read => read.userId.toString() === userId
    );

    if (!alreadyRead) {
      // Add user to readBy array
      message.readBy.push({
        userId,
        readAt: new Date()
      });
      await message.save();

      // Update conversation unread count
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation && conversation.unreadCount[userRole] > 0) {
        conversation.unreadCount[userRole] -= 1;
        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to mark message as read'
    }, { status: 500 });
  }
}