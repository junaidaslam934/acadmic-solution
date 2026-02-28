# Application Route Structure

## Authentication
All roles log in via the unified `/login` page. The system routes users to their respective portal based on role. Forgot/reset password flows are at `/forgot-password` and `/reset-password`.

---

## Admin Routes (`/admin/*`) — Blue accent

- `/admin/login` — Admin login (redirects to `/login`)
- `/admin/dashboard` — Main dashboard with stats
- `/admin/students` — Student management
- `/admin/teachers` — Teacher management
- `/admin/courses` — Course management
- `/admin/weeks` — Week/semester week management
- `/admin/class-advisors` — Class advisor management (Year 1–4)
- `/admin/timetable-generator` — Timetable generation tool
- `/admin/debug` — Debug tools

---

## Class Advisor Routes (`/class-advisor/*`) — Purple accent

- `/class-advisor/dashboard` — Stats, quick actions, info cards
- `/class-advisor/assign-courses` — Assign teachers to courses per year
- `/class-advisor/teacher-preferences` — Manage teacher course preferences
- `/class-advisor/review-outlines` — Review submitted course outlines

---

## Teacher Routes (`/teacher/*`) — Emerald accent

- `/teacher/dashboard` — Assignment stats, courses table, PDF download
- `/teacher/my-courses` — Course cards with outline submission
- `/teacher/schedule` — FCFS timetable booking grid
- `/teacher/attendance` — Mark attendance (course/section/week/session)

---

## Student Routes (`/student/*`)

- `/student/login` — Student login
- `/student/courses` — View enrolled courses
- `/student/attendance` — View attendance records

---

## Coordinator Routes (`/coordinator/*`)

- `/coordinator/dashboard` — Coordinator dashboard

---

## API Routes (`/api/*`)

### Authentication
- `POST /api/auth/login` — Unified login (all roles)
- `POST /api/auth/logout` — Clear auth cookie
- `GET  /api/auth/me` — Get current user from token
- `POST /api/auth/teacher/login` — Teacher-specific login
- `POST /api/auth/student/login` — Student-specific login
- `POST /api/forgot-password` — Request password reset email
- `POST /api/reset-password` — Reset password with token

### Teachers & Courses
- `GET/POST/DELETE /api/teachers` — Teacher CRUD
- `GET/POST/DELETE /api/courses` — Course CRUD
- `GET/POST/DELETE /api/course-assignments` — Teacher-course assignments
- `GET/POST/DELETE /api/teacher-preferences` — Teacher preferences

### Outlines
- `GET/POST /api/outlines` — Course outline management
- `POST /api/outlines/[id]/review` — Review an outline (approve/reject)

### Scheduling & Timetable
- `GET/POST /api/bookings` — FCFS timetable slot bookings
- `GET/POST /api/timetable` — Timetable data
- `POST /api/upload-timetable` — Upload timetable file

### Semesters & Weeks
- `GET/POST/DELETE /api/semesters` — Semester CRUD (planning → active → completed)
- `GET /api/semester-weeks` — Semester weeks
- `GET /api/semester-calendar` — Calendar view
- `GET /api/generate-weeks` — Generate weeks for a semester
- `GET/POST /api/holidays` — Holiday management

### Attendance
- `GET/POST /api/attendance` — Attendance records
- `GET /api/student-attendance` — Student attendance view
- `GET /api/teacher-attendance-report` — Teacher attendance report

### Students & Classes
- `GET/POST /api/students` — Student CRUD
- `GET /api/students-by-class` — Students by year/section
- `GET /api/student-courses` — Student course enrollments

### Other
- `GET /api/class-advisors` — Class advisor data
- `GET /api/coordinators` — Coordinator data
- `GET/POST /api/makeup-classes` — Makeup class management
- `POST /api/send-advisor-emails` — Email notifications
- `POST /api/upload-pdf` — PDF upload
- `POST /api/upload-to-n8n` — N8N integration
- `GET /api/notifications` — Notification data
- `GET /api/users` / `GET /api/users/[id]` — User management
- `GET /api/test-db` — Database connection test

---

## Directory Structure

```
src/app/
├── admin/              ✅ Complete (dark slate sidebar, blue accent)
│   ├── dashboard/
│   ├── students/
│   ├── teachers/
│   ├── courses/
│   ├── weeks/
│   ├── class-advisors/
│   ├── timetable-generator/
│   └── debug/
│
├── class-advisor/      ✅ Complete (dark slate sidebar, purple accent)
│   ├── dashboard/
│   ├── assign-courses/
│   ├── review-outlines/
│   └── teacher-preferences/
│
├── teacher/            ✅ Complete (dark slate sidebar, emerald accent)
│   ├── dashboard/
│   ├── my-courses/
│   ├── schedule/
│   └── attendance/
│
├── student/            Partial
│   ├── login/
│   ├── courses/
│   └── attendance/
│
├── coordinator/        Partial
│   └── dashboard/
│
├── login/              ✅ Unified login (dark theme)
├── forgot-password/
├── reset-password/
│
└── api/                ✅ 35+ API routes
```

---

## Design System

All portals use a consistent design language:

- **Sidebar:** `bg-slate-900`, `w-60`, fixed left
- **Main bg:** `bg-slate-100`
- **Cards:** `bg-white rounded-lg border border-slate-200`
- **Table headers:** `bg-slate-50`, `text-[11px] font-semibold text-slate-600 uppercase tracking-wider`
- **Table rows:** `divide-y divide-slate-100`, `hover:bg-slate-50/50`
- **Inputs:** `border-slate-300 rounded-md text-sm`, focus ring uses portal accent color
- **Badges:** `text-[11px] font-semibold rounded`
- **Accent colors:** Admin=blue, ClassAdvisor=purple, Teacher=emerald
