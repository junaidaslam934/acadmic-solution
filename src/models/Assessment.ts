import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  courseId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  name: string;
  type: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project';
  totalMarks: number;
  description?: string;
  dueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['quiz', 'assignment', 'midterm', 'final', 'project'],
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  dueDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
AssessmentSchema.index({ courseId: 1, teacherId: 1 });
AssessmentSchema.index({ type: 1, isActive: 1 });
AssessmentSchema.index({ createdAt: -1 });

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);