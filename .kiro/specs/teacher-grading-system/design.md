# Teacher Grading System Design

## Overview

The Teacher Grading System is a comprehensive platform that enables teachers to create assessments, grade students, and manage academic evaluations efficiently. The system integrates with the existing academic portal to provide seamless access to course assignments and student data while maintaining academic integrity through secure grade storage and access controls.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Teacher UI    │    │   Student UI    │    │   Admin Panel   │
│   (Grading)     │    │   (View Grades) │    │   (Reports)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Next.js API) │
                    └─────────┬───────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼───────┐ ┌─────────▼───────┐ ┌─────────▼───────┐
│  Grading APIs   │ │   Grade APIs    │ │   Auth Service  │
│  (CRUD)         │ │   (View/Export) │ │   (Session)     │
└─────────┬───────┘ └─────────┬───────┘ └─────────┬───────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    ┌─────────▼───────┐
                    │    MongoDB      │
                    │  (Assessments,  │
                    │    Grades)      │
                    └─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Existing session-based auth system
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks with Context API
- **Validation**: Zod for schema validation

## Components and Interfaces

### Frontend Components

#### Teacher Grading Interface
```typescript
// Main grading layout
GradingLayout: {
  - CourseList (teacher's assigned courses)
  - AssessmentManager (create/edit assessments)
  - GradingInterface (grade students)
  - GradeStatistics (performance analytics)
}

// Course management
CourseList: {
  - CourseCard[]
  - AssessmentCount
  - GradeButton
}

// Assessment management
AssessmentManager: {
  - AssessmentForm
  - AssessmentList
  - AssessmentEditor
}

// Grading interface
GradingInterface: {
  - SectionSelector
  - StudentList
  - GradeEntry
  - BulkActions
}
```

#### Student Grade View
```typescript
// Student grade interface
StudentGradeView: {
  - CourseGradeList
  - AssessmentDetails
  - GradeHistory
  - PerformanceChart
}
```

### Backend API Endpoints

#### Assessment Management
```typescript
// Assessment operations
POST   /api/grading/assessments        // Create new assessment
GET    /api/grading/assessments/:courseId  // Get course assessments
PUT    /api/grading/assessments/:id    // Update assessment
DELETE /api/grading/assessments/:id    // Delete assessment

// Grade operations
POST   /api/grading/grades             // Submit grades
GET    /api/grading/grades/:assessmentId  // Get assessment grades
PUT    /api/grading/grades/:id         // Update individual grade
GET    /api/grading/grades/student/:studentId  // Get student grades

// Statistics and reports
GET    /api/grading/statistics/:assessmentId  // Get grade statistics
GET    /api/grading/reports/:courseId  // Generate course reports
```

## Data Models

### MongoDB Collections

#### Assessments Collection
```typescript
interface Assessment {
  _id: ObjectId;
  courseId: ObjectId;           // Reference to Course
  teacherId: ObjectId;          // Reference to Teacher
  name: string;                 // "Midterm Exam", "Assignment 1"
  type: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project';
  totalMarks: number;           // Maximum possible marks
  description?: string;         // Optional description
  dueDate?: Date;              // Optional due date
  isActive: boolean;           // Can be graded
  createdAt: Date;
  updatedAt: Date;
}
```

#### Grades Collection
```typescript
interface Grade {
  _id: ObjectId;
  assessmentId: ObjectId;       // Reference to Assessment
  studentId: ObjectId;          // Reference to Student
  teacherId: ObjectId;          // Reference to Teacher
  marksObtained: number;        // Actual marks received
  totalMarks: number;           // Total possible marks (for reference)
  percentage: number;           // Calculated percentage
  gradedAt: Date;              // When grade was assigned
  gradedBy: ObjectId;          // Teacher who graded
  comments?: string;           // Optional teacher comments
  isSubmitted: boolean;        // Grade finalized
  auditTrail: {
    action: 'created' | 'updated' | 'deleted';
    performedBy: ObjectId;
    performedAt: Date;
    previousValue?: number;
    newValue?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Grade Statistics Collection (Computed)
```typescript
interface GradeStatistics {
  _id: ObjectId;
  assessmentId: ObjectId;
  courseId: ObjectId;
  section: 'A' | 'B' | 'C';
  totalStudents: number;
  gradedStudents: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;          // Students with >= 50%
  failCount: number;          // Students with < 50%
  gradeDistribution: {
    'A': number;              // 90-100%
    'B': number;              // 80-89%
    'C': number;              // 70-79%
    'D': number;              // 60-69%
    'F': number;              // < 60%
  };
  lastUpdated: Date;
}
```

### Database Indexes
```javascript
// Optimize assessment queries
db.assessments.createIndex({ "courseId": 1, "teacherId": 1 });
db.assessments.createIndex({ "type": 1, "isActive": 1 });

// Optimize grade queries
db.grades.createIndex({ "assessmentId": 1, "studentId": 1 }, { unique: true });
db.grades.createIndex({ "studentId": 1, "gradedAt": -1 });
db.grades.createIndex({ "teacherId": 1, "gradedAt": -1 });

// Optimize statistics queries
db.gradestatistics.createIndex({ "assessmentId": 1 });
db.gradestatistics.createIndex({ "courseId": 1, "section": 1 });
```