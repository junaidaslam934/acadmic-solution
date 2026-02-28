import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  studentName: string;
  rollNumber: string;
  year: 1 | 2 | 3 | 4;
  section: 'A' | 'B' | 'C';
  coursesEnrolled: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      enum: [1, 2, 3, 4],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: ['A', 'B', 'C'],
    },
    coursesEnrolled: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for year+section queries (used in attendance and class lists)
StudentSchema.index({ year: 1, section: 1 });
StudentSchema.index({ isActive: 1 });

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
