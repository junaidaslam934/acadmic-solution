import mongoose from 'mongoose';

const SemesterWeekSchema = new mongoose.Schema({
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  weekNumber: {
    type: Number, // 1, 2, 3, ... 15
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isHoliday: {
    type: Boolean,
    default: false,
  },
  holidayReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate weeks
SemesterWeekSchema.index({ semesterId: 1, weekNumber: 1 }, { unique: true });

export default mongoose.models.SemesterWeek || mongoose.model('SemesterWeek', SemesterWeekSchema);
