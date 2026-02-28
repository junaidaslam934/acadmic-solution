# Class Advisor Portal

## Overview
A dedicated portal for class advisors to manage course assignments and teacher preferences, completely separate from the admin interface.

## Access

### Login URL
`/class-advisor/login`

### Portal Routes
- `/class-advisor/login` - Class advisor login page
- `/class-advisor/dashboard` - Main dashboard with statistics
- `/class-advisor/assign-courses` - Assign teachers to courses (Year 1-4)
- `/class-advisor/teacher-preferences` - Manage teacher course preferences

## Features

### 1. Dashboard
- Overview statistics (courses, assignments, preferences, teachers)
- Quick action cards
- Helpful tips and responsibilities

### 2. Assign Courses
- Select year (1, 2, 3, or 4)
- View all courses for selected year
- Assign teachers to courses via dropdown
- See preferred assignments (⭐ badge)
- Remove assignments
- Assignment summary statistics

### 3. Teacher Preferences
- Add teacher preferences for courses
- Set preference level (high, medium, low)
- Add optional notes
- View all preferences in table format
- Delete preferences
- Automatic preference matching during assignment

## Design

### Color Scheme
- **Primary Color:** Purple (`purple-600`)
- **Accent Colors:** Blue, Green, Yellow
- **Background:** Light gray (`gray-50`)

### Navigation
- Sticky header with portal branding
- Tab-based navigation between sections
- Logout button in header

## Database Collections

### Used Collections
1. **courses** - All available courses
2. **courseassignments** - Teacher-course assignments
3. **teacherpreferences** - Teacher course preferences
4. **teachers** - Teacher information
5. **classadvisors** - Class advisor records

## API Endpoints

### Authentication
- `POST /api/auth/class-advisor/login` - Class advisor login

### Data Management
- `GET /api/courses?year={1-4}` - Get courses
- `GET /api/course-assignments?year={1-4}` - Get assignments
- `POST /api/course-assignments` - Create assignment
- `DELETE /api/course-assignments?id={id}` - Remove assignment
- `GET /api/teacher-preferences` - Get preferences
- `POST /api/teacher-preferences` - Add preference
- `DELETE /api/teacher-preferences?id={id}` - Remove preference
- `GET /api/teachers` - Get all teachers

## Workflow

### Typical Usage Flow

1. **Login**
   - Class advisor logs in at `/class-advisor/login`
   - Credentials verified against ClassAdvisor collection
   - Redirected to dashboard

2. **Set Preferences** (Optional but recommended)
   - Navigate to Teacher Preferences tab
   - Select teacher and course
   - Set preference level (high/medium/low)
   - Add optional notes
   - Save preference

3. **Assign Courses**
   - Navigate to Assign Courses tab
   - Select year (1-4)
   - For each course, select a teacher from dropdown
   - System automatically checks if teacher has preference
   - Assignment saved with preference flag

4. **Monitor Progress**
   - View dashboard for overall statistics
   - Check assignment summary for completion status
   - Review preferred vs non-preferred assignments

## Key Differences from Admin Portal

| Feature | Admin Portal | Class Advisor Portal |
|---------|-------------|---------------------|
| **URL** | `/admin/*` | `/class-advisor/*` |
| **Color** | Blue | Purple |
| **Access** | Admin users | Class advisors only |
| **Features** | Full system management | Course assignments only |
| **Navigation** | Multiple sections | 3 focused tabs |

## Security

- Separate authentication system
- JWT token-based sessions
- Role-based access control
- Token stored in localStorage
- Automatic logout functionality

## Benefits

1. **Separation of Concerns** - Class advisors don't need admin access
2. **Focused Interface** - Only shows relevant features
3. **Better UX** - Tailored specifically for course management
4. **Security** - Limited access to only necessary data
5. **Scalability** - Easy to add more advisor-specific features

## Future Enhancements

- [ ] Bulk course assignment
- [ ] Assignment history and audit log
- [ ] Email notifications for assignments
- [ ] Export assignment reports
- [ ] Teacher workload balancing
- [ ] Conflict detection (same teacher, same time)
- [ ] Academic year management
- [ ] Assignment approval workflow

## Notes

- Class advisors are teachers assigned to manage a specific year
- One class advisor per year (1st, 2nd, 3rd, 4th)
- Preferences help optimize course assignments
- System automatically flags preferred assignments
- All changes are tracked with timestamps
