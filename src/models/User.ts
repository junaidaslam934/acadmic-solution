import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 
  | 'admin' 
  | 'chairman' 
  | 'co_chairman' 
  | 'ug_coordinator' 
  | 'class_advisor' 
  | 'teacher' 
  | 'student';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  // Links to domain-specific models
  teacherId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  // For class advisors: which year they advise
  advisorYear?: 1 | 2 | 3 | 4;
  isActive: boolean;
  lastLoginAt?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['admin', 'chairman', 'co_chairman', 'ug_coordinator', 'class_advisor', 'teacher', 'student'],
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    advisorYear: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.index({ role: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1, role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
