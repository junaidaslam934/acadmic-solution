import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  email: string;
  name: string;
  employeeId: string;
  specialization: string[];
  isActive: boolean;
  classAdvisor?: string; // Year level (1, 2, 3, or 4) that this teacher advises
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    specialization: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    classAdvisor: {
      type: String,
      enum: ['1', '2', '3', '4'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for email lookups
TeacherSchema.index({ email: 1 });
TeacherSchema.index({ isActive: 1 });

const Teacher: Model<ITeacher> = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;
