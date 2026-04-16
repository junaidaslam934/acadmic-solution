import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: {
    student: mongoose.Types.ObjectId;
    teacher: mongoose.Types.ObjectId;
  };
  lastMessage: {
    text: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  unreadCount: {
    student: number;
    teacher: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    }
  },
  lastMessage: {
    text: {
      type: String,
      default: ''
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCount: {
    student: {
      type: Number,
      default: 0
    },
    teacher: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
ConversationSchema.index({ 'participants.student': 1 });
ConversationSchema.index({ 'participants.teacher': 1 });
ConversationSchema.index({ updatedAt: -1 });

// Compound index for finding conversations between specific student and teacher
ConversationSchema.index({ 
  'participants.student': 1, 
  'participants.teacher': 1 
}, { unique: true });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);