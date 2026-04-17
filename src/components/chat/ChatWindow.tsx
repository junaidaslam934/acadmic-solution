'use client';

import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import socketService from '@/lib/socket';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
  currentUserRole: 'student' | 'teacher';
  currentUserName: string;
  isConnected: boolean;
}

export default function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  currentUserId,
  currentUserRole,
  currentUserName,
  isConnected
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation && messages.length > 0) {
      socketService.markAsRead(conversation._id, currentUserId, currentUserRole);
    }
  }, [conversation._id, messages.length, currentUserId, currentUserRole]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(conversation._id, currentUserId, currentUserName);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(conversation._id, currentUserId);
    }, 2000);
  };

  const handleTypingStop = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(conversation._id, currentUserId);
    }
  };

  const getConversationTitle = () => {
    if (currentUserRole === 'student') {
      return (conversation.participants.teacher as any)?.name || 'Teacher';
    } else {
      return (conversation.participants.student as any)?.studentName || 'Student';
    }
  };

  const getConversationSubtitle = () => {
    if (currentUserRole === 'student') {
      return (conversation.participants.teacher as any)?.email || '';
    } else {
      const student = conversation.participants.student as any;
      return student?.rollNumber ? `Roll No: ${student.rollNumber}` : '';
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) {
      return 'Today';
    } else if (dateString === yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{getConversationTitle()}</h3>
            <p className="text-sm text-gray-600">{getConversationSubtitle()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-3xl mb-2">👋</div>
              <p>Start your conversation!</p>
              <p className="text-sm mt-1">Send a message to begin chatting</p>
            </div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex justify-center mb-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDateHeader(date)}
                </span>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-2">
                {dateMessages.map((message, index) => {
                  const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                  const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                  
                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={message.senderId === currentUserId}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator - Disabled for now */}
        {/* {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )} */}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200">
        <MessageInput
          onSendMessage={onSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          disabled={!isConnected}
          placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
        />
      </div>
    </div>
  );
}