import mongoose, { Schema, Document } from 'mongoose';

export interface IGrade extends Document {
  assessmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  gradedAt: Date;
  gradedBy: mongoose.Types.ObjectId;
  comments?: string;
  isSubmitted: boolean;
  auditTrail: {
    action: 'created' | 'updated' | 'deleted';
    performedBy: mongoose.Types.ObjectId;
    performedAt: Date;
    previousValue?: number;
    newValue?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGrade>({
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isSubmitted: {
    type: Boolean,
    default: true
  },
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    previousValue: {
      type: Number
    },
    newValue: {
      type: Number
    }
  }]
}, {
  timestamps: true
});

// Compound index to ensure one grade per student per assessment
GradeSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });
GradeSchema.index({ studentId: 1, gradedAt: -1 });
GradeSchema.index({ teacherId: 1, gradedAt: -1 });

// Pre-save middleware to calculate percentage
GradeSchema.pre('save', function(next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.totalMarks) * 100 * 100) / 100;
  }
  next();
});

export default mongoose.models.Grade || mongoose.model<IGrade>('Grade', GradeSchema);