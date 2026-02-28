import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOutlineReview extends Document {
  outlineId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  reviewerRole: 'class_advisor' | 'ug_coordinator' | 'co_chairman' | 'chairman';
  decision: 'approved' | 'rejected';
  comments: string;
  reviewedAt: Date;
  createdAt: Date;
}

const OutlineReviewSchema = new Schema<IOutlineReview>(
  {
    outlineId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseOutline',
      required: [true, 'Course outline is required'],
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    reviewerRole: {
      type: String,
      enum: ['class_advisor', 'ug_coordinator', 'co_chairman', 'chairman'],
      required: [true, 'Reviewer role is required'],
    },
    decision: {
      type: String,
      enum: ['approved', 'rejected'],
      required: [true, 'Decision is required'],
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, collection: 'outlinereviews' }
);

OutlineReviewSchema.index({ outlineId: 1 });
OutlineReviewSchema.index({ reviewerId: 1 });

const OutlineReview: Model<IOutlineReview> =
  mongoose.models.OutlineReview || mongoose.model<IOutlineReview>('OutlineReview', OutlineReviewSchema);
export default OutlineReview;
