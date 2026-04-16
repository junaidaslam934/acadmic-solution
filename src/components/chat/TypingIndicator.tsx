'use client';

interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users[0]} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-xs text-gray-600">...</span>
      </div>
      
      {/* Typing bubble */}
      <div className="bg-gray-200 rounded-lg px-4 py-2 relative">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{getTypingText()}</span>
          
          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
        
        {/* Bubble tail */}
        <div className="absolute left-0 top-0 -ml-2 w-0 h-0 border-r-8 border-r-gray-200 border-t-8 border-t-transparent"></div>
      </div>
    </div>
  );
}