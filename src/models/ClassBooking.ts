import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClassBooking extends Document {
  semesterId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  year: 1 | 2 | 3 | 4;
  section: string;
  dayOfWeek: number;       // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  slotNumber: number;      // 1-8
  startTime: string;       // "HH:MM"
  endTime: string;         // "HH:MM"
  room?: string;
  bookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClassBookingSchema = new Schema<IClassBooking>(
  {
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseAssignment',
      required: [true, 'Assignment is required'],
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
    },
    dayOfWeek: {
      type: Number,
      required: [true, 'Day of week is required'],
      min: 1,
      max: 6,
    },
    slotNumber: {
      type: Number,
      required: [true, 'Slot number is required'],
      min: 1,
      max: 10,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: '' },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'classbookings' }
);

// Prevent double-booking: same semester + year + section + day + slot
ClassBookingSchema.index(
  { semesterId: 1, year: 1, section: 1, dayOfWeek: 1, slotNumber: 1 },
  { unique: true }
);
// Prevent teacher from booking the same slot across different sections
ClassBookingSchema.index(
  { semesterId: 1, teacherId: 1, dayOfWeek: 1, slotNumber: 1 },
  { unique: true }
);
ClassBookingSchema.index({ semesterId: 1, teacherId: 1 });
ClassBookingSchema.index({ semesterId: 1, year: 1, section: 1 });

const ClassBooking: Model<IClassBooking> =
  mongoose.models.ClassBooking || mongoose.model<IClassBooking>('ClassBooking', ClassBookingSchema);
export default ClassBooking;
