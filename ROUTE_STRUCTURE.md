# Application Route Structure

## ✅ Admin Routes (`/admin/*`)

### Authentication
- `/admin/login` - Admin login page
- `/admin/forgot-password` - Admin password reset request
- `/admin/reset-password` - Admin password reset with token

### Dashboard & Features
- `/admin/dashboard` - Main admin dashboard
  - Add Teachers tab
  - Media Upload tab
- `/admin/timetable-generator` - Timetable generation tool
- `/admin/class-advisors` - Class advisor management (1st-4th year)

---

## 🔜 Teacher Routes (`/teacher/*`) - TODO

### Authentication
- `/teacher/login` - Teacher login page
- `/teacher/forgot-password` - Teacher password reset request
- `/teacher/reset-password` - Teacher password reset with token

### Dashboard & Features
- `/teacher/dashboard` - Teacher dashboard
- `/teacher/my-classes` - View assigned classes
- `/teacher/students` - View students
- `/teacher/timetable` - View teaching schedule

---

## 🔜 Student Routes (`/student/*`) - TODO

### Authentication
- `/student/login` - Student login page
- `/student/forgot-password` - Student password reset request
- `/student/reset-password` - Student password reset with token

### Dashboard & Features
- `/student/dashboard` - Student dashboard
- `/student/timetable` - View class schedule
- `/student/routine` - Manage daily routine
- `/student/grades` - View grades

---

## 🔌 API Routes (`/api/*`)

### Authentication APIs
- `/api/auth/admin/login` - Admin authentication
- `/api/auth/admin/forgot-password` - Admin password reset request
- `/api/auth/admin/reset-password` - Admin password reset
- `/api/auth/teacher/*` - Teacher auth endpoints (TODO)
- `/api/auth/student/*` - Student auth endpoints (TODO)

### Data APIs (Shared across roles)
- `/api/teachers` - Teacher CRUD operations
- `/api/class-advisors` - Class advisor management
- `/api/upload-timetable` - Timetable file upload
- `/api/test-db` - Database connection test

---

## 📁 Old Routes (To be removed/migrated)

These generic routes should be removed as they're now role-specific:

- ❌ `/login` → Use `/admin/login`, `/teacher/login`, or `/student/login`
- ❌ `/forgot-password` → Use role-specific forgot-password pages
- ❌ `/reset-password` → Use role-specific reset-password pages
- ❌ `/routine` → Move to `/student/routine`

---

## 🏗️ Directory Structure

```
src/app/
├── admin/                    ✅ COMPLETE
│   ├── login/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── dashboard/
│   ├── timetable-generator/
│   └── class-advisors/
│
├── teacher/                  🔜 TODO
│   ├── login/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── dashboard/
│   ├── my-classes/
│   ├── students/
│   └── timetable/
│
├── student/                  🔜 TODO
│   ├── login/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── dashboard/
│   ├── timetable/
│   ├── routine/
│   └── grades/
│
└── api/
    ├── auth/
    │   ├── admin/           ✅ Routes created (need implementation)
    │   ├── teacher/         🔜 TODO
    │   └── student/         🔜 TODO
    ├── teachers/            ✅ COMPLETE
    ├── class-advisors/      ✅ COMPLETE
    └── upload-timetable/    ✅ COMPLETE
```

---

## 🎯 Benefits of This Structure

1. **Clear Separation** - Each role has its own isolated interface
2. **Security** - Easy to implement role-based access control
3. **Maintainability** - Changes to one role don't affect others
4. **Scalability** - Easy to add new roles or features
5. **User Experience** - Each role gets a tailored interface

---

## 🚀 Next Steps

1. ✅ Admin routes - COMPLETE
2. 🔜 Implement admin authentication API (`/api/auth/admin/*`)
3. 🔜 Create teacher interface and auth
4. 🔜 Create student interface and auth
5. 🔜 Add middleware for role-based access control
6. 🔜 Remove old generic routes
