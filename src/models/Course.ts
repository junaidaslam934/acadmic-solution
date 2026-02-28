import mongoose from 'mongoose';

export interface ICourse {
  courseCode: string;
  courseName: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  credits: number;
  department?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CourseSchema = new mongoose.Schema<ICourse>(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
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
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    department: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
