import { z } from 'zod';

// ── Student schemas ──
export const studentLoginSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').trim(),
});

export const createStudentSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').trim(),
  rollNumber: z.string().min(1, 'Roll number is required').trim(),
  year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  section: z.enum(['A', 'B', 'C']),
  coursesEnrolled: z.array(z.string().trim()).optional().default([]),
});

// ── Teacher schemas ──
export const teacherLoginSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required').trim(),
});

export const createTeacherSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').trim(),
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  specialization: z.array(z.string().trim()).optional().default([]),
});

// ── Admin schemas ──
export const adminLoginSchema = z.object({
  key: z.union([
    z.string().min(1, 'Key is required'),
    z.object({ keys: z.string().min(1) }),
  ]),
});

// ── Class Advisor schemas ──
export const classAdvisorLoginSchema = z.object({
  advisorId: z.string().min(1, 'Class Advisor ID is required').trim(),
});

// ── Coordinator schemas ──
export const coordinatorLoginSchema = z.object({
  coordinatorId: z.string().min(1, 'Coordinator ID is required').trim(),
});

// ── Course schemas ──
export const createCourseSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required').trim(),
  courseName: z.string().min(1, 'Course name is required').trim(),
  credits: z.number().int().min(1).max(6),
  year: z.number().int().min(1).max(4),
  semester: z.number().int().min(1).max(8),
  department: z.string().optional(),
});

// ── Attendance schemas ──
export const createAttendanceSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  courseName: z.string().optional(),
  year: z.number().int().min(1).max(4),
  section: z.enum(['A', 'B', 'C']),
  attendanceRecords: z.array(z.object({
    studentId: z.string(),
    studentName: z.string(),
    rollNumber: z.string(),
    status: z.enum(['present', 'absent', 'late']),
  })).min(1, 'At least one attendance record is required'),
  weekId: z.string().optional(),
  weekNumber: z.number().int().optional(),
  semesterId: z.string().optional(),
  creditHours: z.number().int().min(1).optional().default(1),
  sessionNumber: z.number().int().min(1).optional().default(1),
});

// ── Forgot/Reset Password schemas ──
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

/**
 * Helper to validate request body against a Zod schema.
 * Returns { data, error } — check error first; if null, data is defined.
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { data: null, error: firstError?.message || 'Invalid input' };
  }
  return { data: result.data, error: null };
}
