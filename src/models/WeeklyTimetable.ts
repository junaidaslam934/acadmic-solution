import mongoose from 'mongoose';

const WeeklyTimetableSchema = new mongoose.Schema({
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  dayOfWeek: {
    type: Number, // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    required: true,
  },
  startTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true,
  },
  endTime: {
    type: String, // Format: "HH:MM" (24-hour)
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  creditHours: {
    type: Number, // Credit hours for this session
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.WeeklyTimetable || mongoose.model('WeeklyTimetable', WeeklyTimetableSchema);
