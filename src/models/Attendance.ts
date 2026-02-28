import mongoose from 'mongoose';

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  rollNumber: string;
  isAbsent: boolean; // true = absent, false = present
}

export interface IAttendance {
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  weekNumber: number; // Week 1-15
  sessionNumber?: number; // Session 1-6 (for credit hours)
  date: Date; // Specific class date
  creditHours: number; // Credit hours for this session
  attendanceRecords: IAttendanceRecord[];
  createdAt?: Date;
  updatedAt?: Date;
}

const AttendanceRecordSchema = new mongoose.Schema<IAttendanceRecord>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema<IAttendance>(
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
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    sessionNumber: {
      type: Number,
      default: 1,
      min: 1,
      max: 6,
    },
    date: {
      type: Date,
      required: true,
    },
    creditHours: {
      type: Number,
      required: true,
      default: 1,
    },
    attendanceRecords: [AttendanceRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AttendanceSchema.index({ teacherId: 1, courseId: 1, weekNumber: 1, sessionNumber: 1 });
AttendanceSchema.index({ semesterId: 1, weekNumber: 1 });
AttendanceSchema.index({ teacherId: 1, semesterId: 1 });
AttendanceSchema.index({ date: 1 });

export default mongoose.models.Attendance || 
  mongoose.model<IAttendance>('Attendance', AttendanceSchema, 'attendanceoverall');
