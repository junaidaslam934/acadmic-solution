import mongoose, { Schema, Document, Model } from 'mongoose';

export type OutlineApprovalStatus =
  | 'submitted'
  | 'advisor_review'
  | 'coordinator_review'
  | 'co_chairman_review'
  | 'chairman_review'
  | 'approved'
  | 'rejected';

export interface ICourseOutline extends Document {
  assignmentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx';
  version: number;
  status: OutlineApprovalStatus;
  currentReviewerRole: 'class_advisor' | 'ug_coordinator' | 'co_chairman' | 'chairman' | null;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseOutlineSchema = new Schema<ICourseOutline>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseAssignment',
      required: [true, 'Course assignment is required'],
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
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx'],
      required: [true, 'File type is required'],
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['submitted', 'advisor_review', 'coordinator_review', 'co_chairman_review', 'chairman_review', 'approved', 'rejected'],
      default: 'submitted',
    },
    currentReviewerRole: {
      type: String,
      enum: ['class_advisor', 'ug_coordinator', 'co_chairman', 'chairman', null],
      default: 'class_advisor',
    },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectedAt: Date,
    rejectionComments: String,
  },
  { timestamps: true, collection: 'courseoutlines' }
);

CourseOutlineSchema.index({ assignmentId: 1 });
CourseOutlineSchema.index({ semesterId: 1, status: 1 });
CourseOutlineSchema.index({ teacherId: 1, semesterId: 1 });

const CourseOutline: Model<ICourseOutline> =
  mongoose.models.CourseOutline || mongoose.model<ICourseOutline>('CourseOutline', CourseOutlineSchema);
export default CourseOutline;
