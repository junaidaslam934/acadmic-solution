import mongoose, { Schema, Document, Model } from 'mongoose';

export type SemesterStatus =
  | 'planning'           // Admin sets up semester, assigns advisors
  | 'course_assignment'  // Class advisors assign courses to teachers
  | 'outline_submission' // Teachers submit course outlines
  | 'outline_review'     // Outlines going through approval chain
  | 'scheduling'         // Teachers schedule their classes (FCFS)
  | 'active'             // Semester is running
  | 'completed';         // Semester ended

export interface ISemesterAdvisor {
  year: 1 | 2 | 3 | 4;
  userId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
}

export interface ITimeSlotConfig {
  slotNumber: number;
  startTime: string;
  endTime: string;
  label: string;
}

export interface ISemester extends Document {
  name: string;
  academicYear: string;
  type: 'fall' | 'spring' | 'summer';
  startDate: Date;
  endDate: Date;
  status: SemesterStatus;
  classAdvisors: ISemesterAdvisor[];
  ugCoordinatorId?: mongoose.Types.ObjectId;
  coChairmanId?: mongoose.Types.ObjectId;
  chairmanId?: mongoose.Types.ObjectId;
  outlineDeadline?: Date;
  schedulingDeadline?: Date;
  timeSlots: ITimeSlotConfig[];
  workingDays: number[];
  sections: Record<number, string[]>; // { 1: ['A','B'], 2: ['A','B','C'], ... }
  createdAt: Date;
  updatedAt: Date;
}

const SemesterAdvisorSchema = new Schema(
  {
    year: { type: Number, required: true, enum: [1, 2, 3, 4] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  },
  { _id: false }
);

const SemesterSchema = new Schema<ISemester>(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      unique: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Semester type is required'],
      enum: ['fall', 'spring', 'summer'],
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    status: {
      type: String,
      enum: ['planning', 'course_assignment', 'outline_submission', 'outline_review', 'scheduling', 'active', 'completed'],
      default: 'planning',
    },
    classAdvisors: { type: [SemesterAdvisorSchema], default: [] },
    ugCoordinatorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    coChairmanId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    chairmanId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    outlineDeadline: Date,
    schedulingDeadline: Date,
    timeSlots: {
      type: [{
        slotNumber: { type: Number, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        label: { type: String, required: true },
      }],
      default: [
        { slotNumber: 1, startTime: '08:30', endTime: '09:20', label: 'Slot 1' },
        { slotNumber: 2, startTime: '09:20', endTime: '10:10', label: 'Slot 2' },
        { slotNumber: 3, startTime: '10:30', endTime: '11:20', label: 'Slot 3' },
        { slotNumber: 4, startTime: '11:20', endTime: '12:10', label: 'Slot 4' },
        { slotNumber: 5, startTime: '12:20', endTime: '13:10', label: 'Slot 5' },
        { slotNumber: 6, startTime: '14:00', endTime: '14:50', label: 'Slot 6' },
        { slotNumber: 7, startTime: '14:50', endTime: '15:40', label: 'Slot 7' },
        { slotNumber: 8, startTime: '15:40', endTime: '16:30', label: 'Slot 8' },
      ],
    },
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    sections: {
      type: Schema.Types.Mixed,
      default: { 1: ['A', 'B'], 2: ['A', 'B'], 3: ['A', 'B'], 4: ['A', 'B'] },
    },
  },
  { timestamps: true, collection: 'semesters' }
);

SemesterSchema.index({ status: 1 });
SemesterSchema.index({ academicYear: 1, type: 1 });

const Semester: Model<ISemester> = mongoose.models.Semester || mongoose.model<ISemester>('Semester', SemesterSchema);
export default Semester;
