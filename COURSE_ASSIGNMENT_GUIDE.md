# Course Assignment System Guide

## Overview
The Course Assignment System allows class advisors to manage course assignments for teachers across all four years of study, with preference tracking.

## Database Collections

### 1. **courses** Collection
Stores all available courses for years 1-4.

**Schema:**
- `courseCode`: Unique identifier (e.g., CS101)
- `courseName`: Full course name
- `year`: 1, 2, 3, or 4
- `semester`: 1 or 2
- `credits`: Number of credits
- `department`: Department name
- `description`: Course description

**Sample Data:** 24 courses (6 per year) already seeded

### 2. **courseassignments** Collection
Tracks which teacher is assigned to which course.

**Schema:**
- `teacherId`: Reference to Teacher
- `courseId`: Reference to Course
- `year`: 1, 2, 3, or 4
- `semester`: 1 or 2
- `isPreferred`: Boolean (auto-set based on teacher preferences)
- `assignedBy`: Reference to ClassAdvisor who made the assignment

**Unique Index:** Prevents duplicate assignments (teacherId + courseId + year + semester)

### 3. **teacherpreferences** Collection
Stores teacher preferences for courses.

**Schema:**
- `teacherId`: Reference to Teacher
- `courseId`: Reference to Course
- `preferenceLevel`: 'high', 'medium', or 'low'
- `notes`: Optional notes about the preference

**Unique Index:** One preference per teacher-course pair

## Features

### 1. Assign Courses to Teachers
**Route:** `/admin/class-advisors/assign-courses`

**Features:**
- Select year (1-4) to view courses
- View all courses for selected year
- Assign teachers to courses via dropdown
- See which courses are already assigned
- View if assignment matches teacher preference (⭐ Preferred badge)
- Remove assignments
- Summary statistics (total, assigned, unassigned)

**How it works:**
1. Select a year (1, 2, 3, or 4)
2. View all courses for that year
3. For unassigned courses, select a teacher from dropdown
4. System automatically checks if teacher has preference for that course
5. Assignment is saved with `isPreferred` flag

### 2. Teacher Preferences
**Route:** `/admin/class-advisors/teacher-preferences`

**Features:**
- Add teacher preferences for courses
- Set preference level (high, medium, low)
- Add optional notes
- View all preferences in a table
- Delete preferences
- Preferences are used during course assignment

**How it works:**
1. Select a teacher
2. Select a course (from any year)
3. Choose preference level
4. Add optional notes
5. When this course is assigned to this teacher, it's automatically marked as "Preferred"

## API Endpoints

### Courses
- `GET /api/courses?year={1-4}` - Get courses (optionally filter by year)
- `POST /api/courses` - Create new course

### Course Assignments
- `GET /api/course-assignments?year={1-4}&teacherId={id}` - Get assignments
- `POST /api/course-assignments` - Create/update assignment
- `DELETE /api/course-assignments?id={id}` - Remove assignment

### Teacher Preferences
- `GET /api/teacher-preferences?teacherId={id}` - Get preferences
- `POST /api/teacher-preferences` - Create/update preference
- `DELETE /api/teacher-preferences?id={id}` - Remove preference

## Seeding Courses

To populate the database with sample courses:

```bash
npm run seed:courses
```

This will create 24 courses:
- **Year 1:** Intro to Programming, Calculus I, English, Physics I, Data Structures, Linear Algebra
- **Year 2:** OOP, DBMS, Statistics, Networks, OS, Discrete Math
- **Year 3:** Software Engineering, Web Dev, AI, Graphics, Mobile Dev, Cybersecurity
- **Year 4:** Machine Learning, Cloud Computing, Big Data, Blockchain, DevOps, Capstone

## Workflow Example

### Scenario: Assigning courses for Year 1

1. **Set Teacher Preferences First** (Optional but recommended)
   - Go to Teacher Preferences tab
   - Add preferences: "Dr. Smith prefers CS101 (High)"
   - Add preferences: "Dr. Jones prefers MATH101 (High)"

2. **Assign Courses**
   - Go to Assign Courses tab
   - Select "Year 1"
   - For CS101, select "Dr. Smith" → Assignment created with ⭐ Preferred badge
   - For MATH101, select "Dr. Jones" → Assignment created with ⭐ Preferred badge
   - For PHY101, select "Dr. Brown" → Assignment created (no preference)

3. **View Results**
   - See summary: 6 total courses, 3 assigned, 3 unassigned
   - Preferred assignments are highlighted

## Benefits

1. **Preference Tracking:** System knows which teachers prefer which courses
2. **Conflict Prevention:** Unique indexes prevent duplicate assignments
3. **Year-wise Management:** Organize assignments by academic year
4. **Audit Trail:** Track who assigned courses and when
5. **Flexibility:** Easy to reassign or remove assignments

## Notes

- The `isPreferred` flag is automatically set when assigning courses
- If a teacher has a preference for a course, the assignment will be marked as preferred
- You can assign courses without setting preferences first
- Preferences can be added/modified at any time
