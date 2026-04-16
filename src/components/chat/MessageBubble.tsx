'use client';

import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (role: string) => {
    return role === 'student' ? 'S' : 'T';
  };

  const getAvatarColor = (role: string) => {
    return role === 'student' ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2 ${getAvatarColor(message.senderRole)}`}>
            {getInitials(message.senderRole)}
          </div>
        )}
        
        {/* Message Content */}
        <div className={`relative px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          {/* Message Text */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text}
          </p>
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-red-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
            
            {/* Read Status for own messages */}
            {isOwn && (
              <span className="ml-1">
                {message.readBy.length > 1 ? '✓✓' : '✓'}
              </span>
            )}
          </div>
          
          {/* Message Tail */}
          <div className={`absolute top-0 w-0 h-0 ${
            isOwn 
              ? 'right-0 -mr-2 border-l-8 border-l-red-600 border-t-8 border-t-transparent' 
              : 'left-0 -ml-2 border-r-8 border-r-gray-200 border-t-8 border-t-transparent'
          }`}></div>
        </div>
        
        {/* Spacer for own messages when no avatar */}
        {!showAvatar && isOwn && <div className="w-8"></div>}
        {!showAvatar && !isOwn && <div className="w-10"></div>}
      </div>
    </div>
  );
}