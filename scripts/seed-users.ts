/**
 * Seed script to create initial users for the academic management system.
 * Run: npx tsx scripts/seed-users.ts
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// User schema inline (to avoid Next.js module resolution issues)
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'chairman', 'co_chairman', 'ug_coordinator', 'class_advisor', 'teacher', 'student'],
    },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    advisorYear: { type: Number, enum: [1, 2, 3, 4], default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true, collection: 'users' }
);

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    employeeId: { type: String },
    specialization: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'teachers' }
);

const SEED_USERS = [
  {
    email: 'admin@university.edu',
    password: 'Admin@123',
    name: 'System Admin',
    role: 'admin',
    createTeacher: false,
  },
  {
    email: 'chairman@university.edu',
    password: 'Chairman@123',
    name: 'Dr. Ahmad Khan (Chairman)',
    role: 'chairman',
    createTeacher: true,
    employeeId: 'EMP-001',
  },
  {
    email: 'cochairman@university.edu',
    password: 'CoChairman@123',
    name: 'Dr. Sara Ahmed (Co-Chairman)',
    role: 'co_chairman',
    createTeacher: true,
    employeeId: 'EMP-002',
  },
  {
    email: 'ugcoordinator@university.edu',
    password: 'Coordinator@123',
    name: 'Dr. Bilal Hussain (UG Coordinator)',
    role: 'ug_coordinator',
    createTeacher: true,
    employeeId: 'EMP-003',
  },
  {
    email: 'advisor1@university.edu',
    password: 'Advisor@123',
    name: 'Prof. Fatima Noor (1st Year Advisor)',
    role: 'class_advisor',
    createTeacher: true,
    employeeId: 'EMP-004',
    advisorYear: 1,
  },
  {
    email: 'advisor2@university.edu',
    password: 'Advisor@123',
    name: 'Prof. Ali Raza (2nd Year Advisor)',
    role: 'class_advisor',
    createTeacher: true,
    employeeId: 'EMP-005',
    advisorYear: 2,
  },
  {
    email: 'advisor3@university.edu',
    password: 'Advisor@123',
    name: 'Prof. Hina Khan (3rd Year Advisor)',
    role: 'class_advisor',
    createTeacher: true,
    employeeId: 'EMP-006',
    advisorYear: 3,
  },
  {
    email: 'advisor4@university.edu',
    password: 'Advisor@123',
    name: 'Prof. Zain Abbas (4th Year Advisor)',
    role: 'class_advisor',
    createTeacher: true,
    employeeId: 'EMP-007',
    advisorYear: 4,
  },
  {
    email: 'teacher1@university.edu',
    password: 'Teacher@123',
    name: 'Dr. Usman Saleem',
    role: 'teacher',
    createTeacher: true,
    employeeId: 'EMP-008',
  },
  {
    email: 'teacher2@university.edu',
    password: 'Teacher@123',
    name: 'Dr. Ayesha Malik',
    role: 'teacher',
    createTeacher: true,
    employeeId: 'EMP-009',
  },
  {
    email: 'teacher3@university.edu',
    password: 'Teacher@123',
    name: 'Dr. Hassan Tariq',
    role: 'teacher',
    createTeacher: true,
    employeeId: 'EMP-010',
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);

  let created = 0;
  let skipped = 0;

  for (const seedUser of SEED_USERS) {
    const existing = await User.findOne({ email: seedUser.email.toLowerCase() });
    if (existing) {
      console.log(`  SKIP: ${seedUser.email} (already exists)`);
      skipped++;
      continue;
    }

    const passwordHash = await bcrypt.hash(seedUser.password, 12);

    let teacherId = null;
    if (seedUser.createTeacher) {
      const teacher = await Teacher.create({
        name: seedUser.name,
        email: seedUser.email.toLowerCase(),
        employeeId: seedUser.employeeId,
        specialization: [],
        isActive: true,
      });
      teacherId = teacher._id;
    }

    await User.create({
      email: seedUser.email.toLowerCase(),
      passwordHash,
      name: seedUser.name,
      role: seedUser.role,
      teacherId,
      advisorYear: seedUser.advisorYear || null,
      isActive: true,
    });

    console.log(`  CREATE: ${seedUser.email} (${seedUser.role})`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
  console.log('\n--- Login Credentials ---');
  console.log('Admin:          admin@university.edu / Admin@123');
  console.log('Chairman:       chairman@university.edu / Chairman@123');
  console.log('Co-Chairman:    cochairman@university.edu / CoChairman@123');
  console.log('UG Coordinator: ugcoordinator@university.edu / Coordinator@123');
  console.log('Advisors:       advisor[1-4]@university.edu / Advisor@123');
  console.log('Teachers:       teacher[1-3]@university.edu / Teacher@123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
