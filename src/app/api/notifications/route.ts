import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const filter: Record<string, unknown> = { userId };
    if (unreadOnly) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return NextResponse.json({ success: true, data: notifications, unreadCount });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { notificationId, userId, markAllRead } = body;

    if (markAllRead && userId) {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ success: false, error: 'notificationId or markAllRead+userId required' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
