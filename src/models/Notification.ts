import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'course_assigned'
  | 'outline_submitted'
  | 'outline_approved'
  | 'outline_rejected'
  | 'review_pending'
  | 'scheduling_open'
  | 'slot_booked'
  | 'semester_update'
  | 'general';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: [
        'course_assigned', 'outline_submitted', 'outline_approved',
        'outline_rejected', 'review_pending', 'scheduling_open',
        'slot_booked', 'semester_update', 'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'notifications' }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
