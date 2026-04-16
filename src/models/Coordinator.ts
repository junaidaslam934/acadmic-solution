import mongoose from 'mongoose';

const coordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'coordinators'
});

export default mongoose.models.Coordinator || mongoose.model('Coordinator', coordinatorSchema);
