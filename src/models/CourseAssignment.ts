import mongoose, { Schema, Document, Model } from 'mongoose';

export type OutlineStatus = 
  | 'pending'           // Teacher hasn't submitted yet
  | 'submitted'         // Submitted, awaiting advisor review
  | 'advisor_review'    // Class advisor reviewing
  | 'coordinator_review'// UG Coordinator reviewing
  | 'co_chairman_review'// Co-Chairman reviewing
  | 'chairman_review'   // Chairman reviewing
  | 'approved'          // Fully approved
  | 'rejected';         // Rejected at some stage

export interface ICourseAssignment extends Document {
  semesterId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  sections: string[];                   // e.g., ['A', 'B']
  creditHoursAssigned: number;          // For shared courses, may be less than total
  isShared: boolean;                    // Whether this course is shared with another teacher
  outlineStatus: OutlineStatus;
  schedulingComplete: boolean;          // Whether classes have been scheduled
  assignedBy: mongoose.Types.ObjectId;  // User who assigned it
  createdAt: Date;
  updatedAt: Date;
}

const CourseAssignmentSchema = new Schema<ICourseAssignment>(
  {
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      enum: [1, 2, 3, 4],
    },
    semester: {
      type: Number,
      enum: [1, 2],
    },
    sections: {
      type: [String],
      default: ['A', 'B'],
    },
    creditHoursAssigned: {
      type: Number,
      min: 1,
      max: 6,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    outlineStatus: {
      type: String,
      enum: ['pending', 'submitted', 'advisor_review', 'coordinator_review', 'co_chairman_review', 'chairman_review', 'approved', 'rejected'],
      default: 'pending',
    },
    schedulingComplete: {
      type: Boolean,
      default: false,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, collection: 'courseassignments' }
);

CourseAssignmentSchema.index({ semesterId: 1, teacherId: 1 });
CourseAssignmentSchema.index({ semesterId: 1, courseId: 1 });
CourseAssignmentSchema.index({ semesterId: 1, year: 1 });
CourseAssignmentSchema.index({ outlineStatus: 1 });

const CourseAssignment: Model<ICourseAssignment> = 
  mongoose.models.CourseAssignment || mongoose.model<ICourseAssignment>('CourseAssignment', CourseAssignmentSchema);
export default CourseAssignment;
