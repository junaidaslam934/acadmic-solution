import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

interface ExtendedNextApiResponse {
  socket: {
    server: SocketServer;
  };
}

export async function GET(req: NextRequest) {
  // This is a placeholder - Socket.IO setup will be done in a custom server
  return new Response('Socket.IO server should be running', { status: 200 });
}

// Socket.IO server logic (to be used in custom server setup)
export function initializeSocketIO(server: NetServer) {
  if (!(server as SocketServer).io) {
    console.log('Initializing Socket.IO server...');
    
    const io = new SocketIOServer(server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware
    io.use(async (socket, next) => {
      try {
        const userId = socket.handshake.auth.userId;
        const userRole = socket.handshake.auth.userRole;
        
        if (!userId || !userRole) {
          return next(new Error('Authentication failed'));
        }
        
        socket.data.userId = userId;
        socket.data.userRole = userRole;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.userId} (${socket.data.userRole})`);

      // Join conversation room
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId);
        console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`User ${socket.data.userId} left conversation ${conversationId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data: {
        conversationId: string;
        text: string;
        senderId: string;
        senderRole: 'student' | 'teacher';
      }) => {
        try {
          await connectDB();
          
          // Verify user authorization
          if (data.senderId !== socket.data.userId) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          // Create and save message
          const message = new Message({
            conversationId: data.conversationId,
            senderId: data.senderId,
            senderRole: data.senderRole,
            text: data.text.trim(),
            readBy: [{
              userId: data.senderId,
              readAt: new Date()
            }]
          });

          await message.save();

          // Update conversation
          const conversation = await Conversation.findById(data.conversationId);
          if (conversation) {
            const recipientRole = data.senderRole === 'student' ? 'teacher' : 'student';
            
            conversation.lastMessage = {
              text: data.text.trim(),
              senderId: data.senderId,
              timestamp: message.createdAt
            };
            conversation.unreadCount[recipientRole] += 1;
            conversation.updatedAt = new Date();
            
            await conversation.save();

            // Broadcast message to conversation room
            io.to(data.conversationId).emit('message_received', {
              ...message.toObject(),
              _id: message._id.toString(),
              conversationId: message.conversationId.toString(),
              senderId: message.senderId.toString()
            });

            // Broadcast conversation update
            io.to(data.conversationId).emit('conversation_updated', {
              ...conversation.toObject(),
              _id: conversation._id.toString()
            });
          }

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: {
        conversationId: string;
        userId: string;
        userName: string;
      }) => {
        socket.to(data.conversationId).emit('user_typing', {
          conversationId: data.conversationId,
          userId: data.userId,
          userName: data.userName
        });
      });

      socket.on('typing_stop', (data: {
        conversationId: string;
        userId: string;
      }) => {
        socket.to(data.conversationId).emit('user_stopped_typing', {
          conversationId: data.conversationId,
          userId: data.userId
        });
      });

      // Handle marking messages as read
      socket.on('mark_read', async (data: {
        conversationId: string;
        userId: string;
        userRole: 'student' | 'teacher';
      }) => {
        try {
          await connectDB();
          
          // Mark all unread messages in conversation as read
          const messages = await Message.find({
            conversationId: data.conversationId,
            senderId: { $ne: data.userId },
            'readBy.userId': { $ne: data.userId }
          });

          for (const message of messages) {
            message.readBy.push({
              userId: data.userId,
              readAt: new Date()
            });
            await message.save();
          }

          // Reset unread count for user
          await Conversation.findByIdAndUpdate(data.conversationId, {
            [`unreadCount.${data.userRole}`]: 0
          });

          // Broadcast read status update
          socket.to(data.conversationId).emit('messages_read', {
            conversationId: data.conversationId,
            userId: data.userId,
            readAt: new Date()
          });

        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.userId}`);
      });
    });

    (server as SocketServer).io = io;
  }
  
  return (server as SocketServer).io;
}