import mongoose from 'mongoose';

export interface ICourseAssignment {
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  isPreferred: boolean;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt?: Date;
  updatedAt?: Date;
}

const CourseAssignmentSchema = new mongoose.Schema<ICourseAssignment>(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
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
    isPreferred: {
      type: Boolean,
      default: false,
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAdvisor',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate assignments
CourseAssignmentSchema.index({ teacherId: 1, courseId: 1, year: 1, semester: 1 }, { unique: true });

export default mongoose.models.CourseAssignment || 
  mongoose.model<ICourseAssignment>('CourseAssignment', CourseAssignmentSchema, 'courseasigned');
