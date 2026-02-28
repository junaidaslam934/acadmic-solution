# Academic Solution Portal

A comprehensive academic management system built with **Next.js 16**, **MongoDB Atlas**, **Tailwind CSS 4**, and **TypeScript**. Features role-based portals for admins, class advisors, teachers, and students.

## Tech Stack

- **Framework:** Next.js 16.1.6 (Turbopack)
- **Database:** MongoDB Atlas (Mongoose 9.0.1)
- **Styling:** Tailwind CSS 4
- **Auth:** JWT (httpOnly cookies, 7-day expiry)
- **Validation:** Zod
- **Language:** TypeScript (strict)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local`:

```
MONGODB_URI=mongodb+srv://academics:DmPgDYCw7E3Mydlt@cluster0.datu5om.mongodb.net/academics
JWT_SECRET=your-jwt-secret-key
```

## Portals & Design System

All portals share a unified design system: dark slate sidebar (`bg-slate-900`), `bg-slate-100` main background, white cards with `border-slate-200`, consistent table headers, and compact spacing.

| Portal | URL | Accent Color | Sidebar Icon |
|--------|-----|-------------|-------------|
| **Admin** | `/admin/*` | Blue (`bg-blue-500`) | A |
| **Class Advisor** | `/class-advisor/*` | Purple (`bg-purple-500`) | CA |
| **Teacher** | `/teacher/*` | Emerald (`bg-emerald-500`) | T |
| **Student** | `/student/*` | — | — |

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.edu | Admin@123 |
| Chairman | chairman@university.edu | Chairman@123 |
| Co-Chairman | cochairman@university.edu | CoChairman@123 |
| UG Coordinator | ugcoordinator@university.edu | Coordinator@123 |
| Class Advisor (×4) | advisor1-4@university.edu | Advisor@123 |
| Teacher (×3) | teacher1-3@university.edu | Teacher@123 |

All users log in via the unified `/login` page which routes to the correct portal.

## Key Features

- **Admin:** User management, semesters (planning → active → completed), courses, timetable generator
- **Class Advisor:** Assign teachers to courses, manage preferences, review outlines, download PDF reports
- **Teacher:** View assignments, FCFS schedule booking, submit outlines, mark attendance
- **Student:** View courses, attendance tracking

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin portal pages
│   ├── class-advisor/  # Class advisor portal pages
│   ├── teacher/        # Teacher portal pages
│   ├── student/        # Student portal pages
│   ├── api/            # API routes
│   └── login/          # Unified login page
├── components/         # Reusable UI components
├── lib/                # DB connection, utils, auth helpers
├── models/             # Mongoose models (14 models)
└── types/              # TypeScript type definitions
```

## Documentation

- [CLASS_ADVISOR_PORTAL.md](CLASS_ADVISOR_PORTAL.md) — Class advisor portal guide
- [ROUTE_STRUCTURE.md](ROUTE_STRUCTURE.md) — Full route and API reference
- [COURSE_ASSIGNMENT_GUIDE.md](COURSE_ASSIGNMENT_GUIDE.md) — Course assignment system
- [MONGODB_SETUP.md](MONGODB_SETUP.md) — Database setup instructions
