import mongoose from 'mongoose';

export interface ICourseAssignment {
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  isPreferred: boolean;
  assignedBy?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  updatedAt?: Date;
  // New fields for multi-teacher support (optional for backward compatibility)
  creditHours?: number; // Credit hours assigned to this teacher for this course
  teachingRole?: 'primary' | 'secondary' | 'lab' | 'tutorial'; // Role of teacher in this course
  responsibilities?: string[]; // Array of responsibilities (e.g., ['lectures', 'labs', 'grading'])
  isActive?: boolean; // Whether this assignment is currently active
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
    // New fields for multi-teacher support (with defaults for backward compatibility)
    creditHours: {
      type: Number,
      required: false, // Make optional for backward compatibility
      min: 0,
      max: 6,
      default: 3, // Default value
    },
    teachingRole: {
      type: String,
      enum: ['primary', 'secondary', 'lab', 'tutorial'],
      default: 'primary',
      required: false, // Make optional for backward compatibility
    },
    responsibilities: [{
      type: String,
      enum: ['lectures', 'labs', 'tutorials', 'grading', 'assignments', 'projects', 'exams']
    }],
    isActive: {
      type: Boolean,
      default: true,
      required: false, // Make optional for backward compatibility
    }
  },
  {
    timestamps: true,
  }
);

// Compound index to allow multiple teachers per course but prevent duplicate teacher-course-role combinations
CourseAssignmentSchema.index({ 
  teacherId: 1, 
  courseId: 1, 
  year: 1, 
  semester: 1, 
  teachingRole: 1 
}, { unique: true });

// Index for efficient queries
CourseAssignmentSchema.index({ courseId: 1, year: 1, semester: 1, isActive: 1 });
CourseAssignmentSchema.index({ teacherId: 1, isActive: 1 });

export default mongoose.models.CourseAssignment || 
  mongoose.model<ICourseAssignment>('CourseAssignment', CourseAssignmentSchema, 'courseasigned');
