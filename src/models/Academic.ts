import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAcademic extends Document {
  studentId: string;
  email: string;
  passwordHash: string;
  name: string;
  course: string;
  semester: number;
  academicYear: string;
  rollNumber: string;
  contactNumber?: string;
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicSchema = new Schema<IAcademic>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetToken: String,
    resetTokenExpiry: Date,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

const Academic: Model<IAcademic> = mongoose.models.Academic || mongoose.model<IAcademic>('Academic', AcademicSchema);

export default Academic;
