# Course Assignment Setup Guide

## Issues Fixed

### 1. Teachers Not Showing (Only 1 visible)
**Problem:** The Teacher model had a unique constraint on the email field, preventing multiple teachers with the same email.
**Solution:** 
- Removed `unique: true` from the email field in the Teacher model
- Created a migration script to drop the existing unique index

### 2. Courses Not Showing
**Problem:** Courses were stored in the raw `allcourses` MongoDB collection, but the API was checking the Mongoose model first (which was empty).
**Solution:** Updated `src/app/api/courses/route.ts` to check the raw collection first, then fall back to the Mongoose model.

## Setup Instructions

### Step 1: Fix Teacher Index
Drop the existing unique index on email:

```bash
ts-node scripts/fix-teacher-index.ts
```

This will:
- Drop the unique email index
- Clear existing teachers

### Step 2: Reseed Teachers
Add all 20 teachers with the same email:

```bash
npm run seed:teachers
# or
ts-node scripts/seed-teachers.ts
```

### Step 3: Verify Courses
Courses should now be visible from the `allcourses` collection. If you need to add more courses:

```bash
ts-node scripts/seed-dsa-course.ts
```

### Step 4: Access Course Assignment Tab
Navigate to `/admin/courses` to access the course assignment interface.

## Features

- **Year-based Tabs:** Separate tabs for 1st, 2nd, 3rd, and 4th year courses
- **Teacher Selection:** Dropdown showing all available teachers (supports duplicate emails)
- **Course Selection:** Dropdown showing courses for the selected year
- **Preferred Flag:** Mark courses as preferred for teachers
- **Assignment Management:** View, add, and remove course assignments
- **Data Storage:** All assignments saved to `CourseAssignment` collection

## Database Collections

- **Teachers:** `teachers` (Mongoose model) - now allows duplicate emails
- **Courses:** `allcourses` (raw MongoDB collection)
- **Course Assignments:** `courseassignments` (Mongoose model)

## API Endpoints

- `GET /api/teachers` - Get all teachers
- `GET /api/courses` - Get all courses (checks raw collection first)
- `GET /api/course-assignments?year=1` - Get assignments for a year
- `POST /api/course-assignments` - Create new assignment
- `DELETE /api/course-assignments?id=<id>` - Delete assignment
