import mongoose from 'mongoose';

export interface ICourse {
  courseCode: string; // e.g., "CS101", "MATH201"
  courseName: string; // e.g., "Introduction to Programming"
  totalCreditHours: number; // Total credit hours for the course
  lectureHours: number; // Hours per week for lectures
  labHours: number; // Hours per week for labs
  tutorialHours: number; // Hours per week for tutorials
  department: string; // Department offering the course
  year: 1 | 2 | 3 | 4; // Academic year level
  semester: 1 | 2; // Semester when offered
  prerequisites: mongoose.Types.ObjectId[]; // Array of prerequisite course IDs
  description: string; // Course description
  isActive: boolean; // Whether course is currently offered
}

const CourseSchema = new mongoose.Schema<ICourse>(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    totalCreditHours: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    lectureHours: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    labHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    tutorialHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    department: {
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
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
CourseSchema.index({ courseCode: 1 });
CourseSchema.index({ department: 1, year: 1, semester: 1 });
CourseSchema.index({ isActive: 1 });

export default mongoose.models.Course || 
  mongoose.model<ICourse>('Course', CourseSchema);