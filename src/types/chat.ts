export interface Conversation {
  _id: string;
  participants: {
    student: string;    // Student ObjectId
    teacher: string;    // Teacher ObjectId
  };
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: {
    student: number;    // Unread messages for student
    teacher: number;    // Unread messages for teacher
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'teacher';
  text: string;
  readBy: {
    userId: string;
    readAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

// Socket.IO event types
export interface SocketEvents {
  // Client to Server
  join_conversation: (conversationId: string) => void;
  send_message: (data: {
    conversationId: string;
    text: string;
    senderId: string;
    senderRole: 'student' | 'teacher';
  }) => void;
  typing_start: (data: {
    conversationId: string;
    userId: string;
  }) => void;
  typing_stop: (data: {
    conversationId: string;
    userId: string;
  }) => void;
  mark_read: (data: {
    conversationId: string;
    userId: string;
  }) => void;

  // Server to Client
  message_received: (message: Message) => void;
  message_read: (data: {
    messageId: string;
    userId: string;
    readAt: Date;
  }) => void;
  user_typing: (data: {
    conversationId: string;
    userId: string;
    userName: string;
  }) => void;
  user_stopped_typing: (data: {
    conversationId: string;
    userId: string;
  }) => void;
  conversation_updated: (conversation: Conversation) => void;
}

// API Response types
export interface ConversationResponse {
  success: boolean;
  conversation?: Conversation;
  conversations?: Conversation[];
  message?: string;
}

export interface MessageResponse {
  success: boolean;
  message?: Message;
  messages?: Message[];
  error?: string;
}

export interface TeacherListResponse {
  success: boolean;
  teachers?: ChatUser[];
  message?: string;
}

// Chat UI State types
export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  typingUsers: string[];
  unreadCount: number;
}

export interface TypingState {
  [conversationId: string]: {
    [userId: string]: {
      userName: string;
      timestamp: number;
    };
  };
}