import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClassAdvisor extends Document {
  teacherId: mongoose.Types.ObjectId;
  year: number; // 1, 2, 3, or 4
  createdAt: Date;
  updatedAt: Date;
}

const ClassAdvisorSchema = new Schema<IClassAdvisor>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 4,
    },
  },
  {
    timestamps: true,
    collection: 'classadvisors', // Explicitly set collection name
  }
);

// Create a unique index to ensure one teacher per year
ClassAdvisorSchema.index({ year: 1 }, { unique: true });

const ClassAdvisor: Model<IClassAdvisor> = 
  mongoose.models.ClassAdvisor || mongoose.model<IClassAdvisor>('ClassAdvisor', ClassAdvisorSchema);

export default ClassAdvisor;
