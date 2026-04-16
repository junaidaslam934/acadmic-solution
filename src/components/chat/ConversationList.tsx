'use client';

import { useState, useEffect } from 'react';
import { Conversation, ChatUser } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: (teacherId: string) => void;
  userRole: 'student' | 'teacher';
  userId: string;
}

export default function ConversationList({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  userRole,
  userId
}: ConversationListProps) {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [teachers, setTeachers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTeachers = async () => {
    if (userRole !== 'student') return;

    try {
      console.log('Loading teachers for student:', userId);
      const response = await fetch(`/api/chat/teachers?studentId=${userId}`);
      const data = await response.json();
      
      console.log('Teachers API response:', data);
      
      if (data.success) {
        console.log('Teachers found:', data.teachers?.length || 0);
        setTeachers(data.teachers || []);
      } else {
        console.error('Failed to load teachers:', data.message);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleNewChatClick = () => {
    setShowNewChatModal(true);
    loadTeachers();
  };

  const handleTeacherSelect = (teacherId: string) => {
    onNewConversation(teacherId);
    setShowNewChatModal(false);
    setSearchTerm('');
  };

  const getConversationName = (conversation: Conversation) => {
    if (userRole === 'student') {
      return (conversation.participants.teacher as any)?.name || 'Teacher';
    } else {
      return (conversation.participants.student as any)?.studentName || 'Student';
    }
  };

  const getConversationSubtitle = (conversation: Conversation) => {
    if (userRole === 'student') {
      return (conversation.participants.teacher as any)?.email || '';
    } else {
      return (conversation.participants.student as any)?.rollNumber || '';
    }
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
          {userRole === 'student' && (
            <button
              onClick={handleNewChatClick}
              className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              New Chat
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-2xl mb-2">📭</div>
            <p className="text-sm">No conversations yet</p>
            {userRole === 'student' && (
              <p className="text-xs mt-1">Start a new chat with a teacher</p>
            )}
          </div>
        ) : (
          conversations.map((conversation) => {
            const unreadCount = userRole === 'student' 
              ? conversation.unreadCount.student 
              : conversation.unreadCount.teacher;
            
            return (
              <div
                key={conversation._id}
                onClick={() => onConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentConversation?._id === conversation._id ? 'bg-red-50 border-r-4 border-red-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getConversationName(conversation)}
                      </h3>
                      {conversation.lastMessage.timestamp && (
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {getConversationSubtitle(conversation)}
                    </p>
                    {conversation.lastMessage.text && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage.text}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div className="bg-red-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />

            {/* Teacher List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredTeachers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No teachers found</p>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    onClick={() => handleTeacherSelect(teacher._id)}
                    className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 mb-2"
                  >
                    <div className="font-medium text-gray-900">{teacher.name}</div>
                    <div className="text-sm text-gray-600">{teacher.email}</div>
                    {(teacher as any).specialization && (teacher as any).specialization.length > 0 && (
                      <div className="text-xs text-gray-500">{(teacher as any).specialization.join(', ')}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}