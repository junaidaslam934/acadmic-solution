export type AssessmentType = 'quiz' | 'assignment' | 'midterm' | 'final' | 'project';
export type Section = 'A' | 'B' | 'C';
export type GradeAction = 'created' | 'updated' | 'deleted';

export interface Assessment {
  _id: string;
  courseId: string;
  teacherId: string;
  name: string;
  type: AssessmentType;
  totalMarks: number;
  description?: string;
  dueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  _id: string;
  assessmentId: string;
  studentId: string;
  teacherId: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  gradedAt: Date;
  gradedBy: string;
  comments?: string;
  isSubmitted: boolean;
  auditTrail: {
    action: GradeAction;
    performedBy: string;
    performedAt: Date;
    previousValue?: number;
    newValue?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeStatistics {
  _id: string;
  assessmentId: string;
  courseId: string;
  section: Section;
  totalStudents: number;
  gradedStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;
  failCount: number;
  gradeDistribution: {
    A: number; // 90-100%
    B: number; // 80-89%
    C: number; // 70-79%
    D: number; // 60-69%
    F: number; // < 60%
  };
  lastUpdated: Date;
}

export interface StudentGrade {
  studentId: string;
  studentName: string;
  rollNumber: string;
  section: Section;
  marksObtained?: number;
  percentage?: number;
  isGraded: boolean;
  comments?: string;
}

export interface CourseWithAssessments {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
  credits: number;
  assessmentCount: number;
  totalStudents: number;
}

// API Response types
export interface AssessmentResponse {
  success: boolean;
  assessment?: Assessment;
  assessments?: Assessment[];
  message?: string;
}

export interface GradeResponse {
  success: boolean;
  grade?: Grade;
  grades?: Grade[];
  message?: string;
}

export interface StatisticsResponse {
  success: boolean;
  statistics?: GradeStatistics;
  message?: string;
}

export interface StudentGradesResponse {
  success: boolean;
  grades?: {
    courseId: string;
    courseName: string;
    courseCode: string;
    assessments: {
      assessmentId: string;
      assessmentName: string;
      type: AssessmentType;
      marksObtained?: number;
      totalMarks: number;
      percentage?: number;
      gradedAt?: Date;
    }[];
  }[];
  message?: string;
}