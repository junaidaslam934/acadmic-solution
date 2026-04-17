import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';

// GET /api/chat/conversations/[id] - Get specific conversation
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: conversationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate('participants.teacher', 'name email')
      .populate('participants.student', 'studentName rollNumber')
      .lean();

    if (!conversation) {
      return NextResponse.json({
        success: false,
        message: 'Conversation not found'
      }, { status: 404 });
    }

    // Check if user is a participant in this conversation
    const isParticipant = 
      conversation.participants.student._id.toString() === userId ||
      conversation.participants.teacher._id.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to conversation'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch conversation'
    }, { status: 500 });
  }
}