import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionalMarks extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: string; // Course ID from course assignments
  teacherId: mongoose.Types.ObjectId;
  year: number;
  semester: number;
  section: 'A' | 'B' | 'C';
  
  // Marks breakdown
  quizMarks: number;
  quizTotal: number;
  assignmentMarks: number;
  assignmentTotal: number;
  midMarks: number;
  midTotal: number;
  
  // Total sessional
  totalMarks: number;
  totalPossible: number;
  
  // Metadata
  lastUpdatedBy: mongoose.Types.ObjectId;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionalMarksSchema = new Schema<ISessionalMarks>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    section: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C'],
    },
    quizMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizTotal: {
      type: Number,
      default: 10,
      min: 0,
    },
    assignmentMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignmentTotal: {
      type: Number,
      default: 10,
      min: 0,
    },
    midMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    midTotal: {
      type: Number,
      default: 20,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPossible: {
      type: Number,
      default: 40,
      min: 0,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one record per student per course
SessionalMarksSchema.index({ 
  studentId: 1, 
  courseId: 1, 
  year: 1, 
  semester: 1 
}, { unique: true });

// Calculate total marks before saving
SessionalMarksSchema.pre('save', function(next) {
  this.totalMarks = this.quizMarks + this.assignmentMarks + this.midMarks;
  this.totalPossible = this.quizTotal + this.assignmentTotal + this.midTotal;
  next();
});

const SessionalMarks = mongoose.models.SessionalMarks || 
  mongoose.model<ISessionalMarks>('SessionalMarks', SessionalMarksSchema);

export default SessionalMarks;