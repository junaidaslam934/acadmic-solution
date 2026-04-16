import mongoose from 'mongoose';

export interface IClassAdvisor {
  email: string;
  name: string;
  employeeId: string;
  password: string;
  assignedClass: string;
  department: string;
  isActive: boolean;
  adminLevel: 'class-advisor' | 'admin';
}

const ClassAdvisorSchema = new mongoose.Schema<IClassAdvisor>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  assignedClass: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminLevel: {
    type: String,
    enum: ['class-advisor', 'admin'],
    default: 'class-advisor'
  }
}, {
  timestamps: true
});

const ClassAdvisor = mongoose.models.ClassAdvisor || mongoose.model<IClassAdvisor>('ClassAdvisor', ClassAdvisorSchema);

export default ClassAdvisor;