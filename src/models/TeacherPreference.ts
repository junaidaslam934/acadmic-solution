import mongoose from 'mongoose';

export interface ITeacherPreference {
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  preferenceLevel: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TeacherPreferenceSchema = new mongoose.Schema<ITeacherPreference>(
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
    preferenceLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate preferences
TeacherPreferenceSchema.index({ teacherId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.TeacherPreference || 
  mongoose.model<ITeacherPreference>('TeacherPreference', TeacherPreferenceSchema);
