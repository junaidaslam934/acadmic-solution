import mongoose, { Schema, Document } from 'mongoose';

export interface ISimpleGrade extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  courseCode: string; // Use course code instead of ID
  courseName: string;
  year: number;
  semester: number;
  section: 'A' | 'B' | 'C';
  
  // Simple sessional marks
  sessionalMarks: number;
  totalMarks: number; // Default 40
  
  // Metadata
  comments?: string;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SimpleGradeSchema = new Schema<ISimpleGrade>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
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
    sessionalMarks: {
      type: Number,
      required: true,
      min: 0,
      max: 40,
    },
    totalMarks: {
      type: Number,
      default: 40,
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one grade per student per course
SimpleGradeSchema.index({ 
  studentId: 1, 
  courseCode: 1, 
  year: 1, 
  semester: 1 
}, { unique: true });

const SimpleGrade = mongoose.models.SimpleGrade || 
  mongoose.model<ISimpleGrade>('SimpleGrade', SimpleGradeSchema);

export default SimpleGrade;