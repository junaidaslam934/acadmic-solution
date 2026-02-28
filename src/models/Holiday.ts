import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);
