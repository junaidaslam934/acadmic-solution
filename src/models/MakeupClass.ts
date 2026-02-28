import mongoose from 'mongoose';

const MakeupClassSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: true,
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  creditHours: {
    type: Number,
    required: true,
  },
  reason: {
    type: String, // e.g., "Make-up for holiday on Feb 15"
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.MakeupClass || mongoose.model('MakeupClass', MakeupClassSchema);
