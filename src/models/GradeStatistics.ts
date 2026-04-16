import mongoose, { Schema, Document } from 'mongoose';

export interface IGradeStatistics extends Document {
  assessmentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  section: 'A' | 'B' | 'C';
  totalStudents: number;
  gradedStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;
  failCount: number;
  gradeDistribution: {
    A: number; // 90-100%
    B: number; // 80-89%
    C: number; // 70-79%
    D: number; // 60-69%
    F: number; // < 60%
  };
  lastUpdated: Date;
}

const GradeStatisticsSchema = new Schema<IGradeStatistics>({
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  section: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  },
  totalStudents: {
    type: Number,
    required: true,
    min: 0
  },
  gradedStudents: {
    type: Number,
    required: true,
    min: 0
  },
  averageMarks: {
    type: Number,
    required: true,
    min: 0
  },
  highestMarks: {
    type: Number,
    required: true,
    min: 0
  },
  lowestMarks: {
    type: Number,
    required: true,
    min: 0
  },
  passCount: {
    type: Number,
    required: true,
    min: 0
  },
  failCount: {
    type: Number,
    required: true,
    min: 0
  },
  gradeDistribution: {
    A: { type: Number, default: 0, min: 0 },
    B: { type: Number, default: 0, min: 0 },
    C: { type: Number, default: 0, min: 0 },
    D: { type: Number, default: 0, min: 0 },
    F: { type: Number, default: 0, min: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes for performance optimization
GradeStatisticsSchema.index({ assessmentId: 1 });
GradeStatisticsSchema.index({ courseId: 1, section: 1 });

export default mongoose.models.GradeStatistics || mongoose.model<IGradeStatistics>('GradeStatistics', GradeStatisticsSchema);