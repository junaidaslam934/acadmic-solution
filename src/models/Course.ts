import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  courseName: string;
  abbreviation: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  credits: number;
  type: 'theory' | 'lab' | 'both';
  department?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    abbreviation: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      enum: [1, 2, 3, 4],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      enum: [1, 2],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 6,
    },
    type: {
      type: String,
      enum: ['theory', 'lab', 'both'],
      default: 'theory',
    },
    department: { type: String, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'courses' }
);

CourseSchema.index({ year: 1, semester: 1 });
CourseSchema.index({ isActive: 1 });

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
