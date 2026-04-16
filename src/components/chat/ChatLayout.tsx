'use client';

import { useState, useEffect } from 'react';
import { Conversation, Message, ChatUser } from '@/types/chat';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import socketService from '@/lib/socket';

interface ChatLayoutProps {
  userId: string;
  userRole: 'student' | 'teacher';
  userName: string;
}

export default function ChatLayout({ userId, userRole, userName }: ChatLayoutProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Initialize chat and load conversations
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Connect to chat service (HTTP-based)
        await socketService.connect(userId, userRole);
        setIsConnected(true);

        // Load conversations
        await loadConversations();

        // Set up message listeners
        setupMessageListeners();

      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [userId, userRole]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/chat/conversations?userId=${userId}&userRole=${userRole}`);
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const setupMessageListeners = () => {
    // Handle new messages
    socketService.onMessageReceived((message: Message) => {
      if (currentConversation && message.conversationId === currentConversation._id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update conversation list
      loadConversations();
    });

    // Handle conversation updates
    socketService.onConversationUpdated((conversation: Conversation) => {
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversation._id ? conversation : conv
        )
      );
    });

    // Handle errors
    socketService.onError((error) => {
      console.error('Chat error:', error);
    });
  };

  const handleConversationSelect = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages([]);
    setTypingUsers([]);

    // Join conversation room
    socketService.joinConversation(conversation._id);

    // Load messages
    try {
      const response = await fetch(
        `/api/chat/messages?conversationId=${conversation._id}&userId=${userId}`
      );
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
        
        // Mark messages as read
        socketService.markAsRead(conversation._id, userId, userRole);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentConversation || !text.trim()) return;

    try {
      // Send message via HTTP API
      const result = await socketService.sendMessage({
        conversationId: currentConversation._id,
        text: text.trim(),
        senderId: userId,
        senderRole: userRole
      });

      if (result?.success) {
        // Add message to local state immediately for better UX
        setMessages(prev => [...prev, result.message]);
        
        // Reload conversations to update last message
        await loadConversations();
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewConversation = async (teacherId: string) => {
    if (userRole !== 'student') return;

    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: userId,
          teacherId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadConversations();
        handleConversationSelect(data.conversation);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-gray-200">
        <ConversationList
          conversations={conversations}
          currentConversation={currentConversation}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          userRole={userRole}
          userId={userId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {currentConversation ? (
          <ChatWindow
            conversation={currentConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={userId}
            currentUserRole={userRole}
            currentUserName={userName}
            typingUsers={[]}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg">Select a conversation to start chatting</p>
              {userRole === 'student' && (
                <p className="text-sm mt-2">Click "New Chat" to message a teacher</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
          ⚠️ Disconnected - Trying to reconnect...
        </div>
      )}
    </div>
  );
}