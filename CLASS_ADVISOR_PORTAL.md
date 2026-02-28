# Class Advisor Portal

## Overview
A dedicated portal for class advisors to manage course assignments, teacher preferences, and course outline reviews. Features a dark slate sidebar with purple accent, consistent with the system-wide design.

## Access

### Login
All users log in via the unified `/login` page. Class advisors are routed to `/class-advisor/dashboard` after authentication.

### Portal Routes
- `/class-advisor/dashboard` — Stats, quick actions, info cards
- `/class-advisor/assign-courses` — Assign teachers to courses (per advisor year)
- `/class-advisor/teacher-preferences` — Manage teacher course preferences
- `/class-advisor/review-outlines` — Review submitted course outlines

## Features

### 1. Dashboard
- 4 stat cards: Total Courses, Assignments, Preferences, Teachers
- 3 quick action links (Assign Courses, Review Outlines, Preferences)
- Info cards: Responsibilities and Tips

### 2. Assign Courses
- Auto-detects advisor year from login (stored in localStorage)
- Gradient banner showing year context
- Progress bar for assignment completion
- Teacher dropdown with specialization display
- Preferred assignment checkbox
- PDF download of assignments (via jsPDF + autoTable)
- View mode for existing assignments with reassign option

### 3. Teacher Preferences
- Add preferences: select teacher + course + level (high/medium/low) + notes
- Preferences table with badge colors per level
- Delete individual preferences
- Info box explaining preference-assignment linking

### 4. Review Outlines
- Lists outlines where `currentReviewerRole = class_advisor`
- Status badges (submitted, advisor_review, approved, rejected, etc.)
- Inline review form with comments + approve/reject buttons
- File download link per outline

## Design

### Color Scheme
- **Sidebar:** Dark slate (`bg-slate-900`) with purple active state (`bg-purple-600`)
- **Accent:** Purple (`purple-500` / `purple-600`)
- **Background:** `bg-slate-100`
- **Cards:** `bg-white rounded-lg border border-slate-200`
- **Inputs:** `border-slate-300`, focus ring `ring-purple-500`
- **Table headers:** `bg-slate-50`, `text-[11px] font-semibold text-slate-600 uppercase tracking-wider`
- **Badges:** `text-[11px] font-semibold`, `rounded` (not rounded-full)

### Navigation
- Fixed dark sidebar (w-60) with icon + label nav links
- Sticky white top header showing current page title
- Mobile hamburger menu with overlay
- User avatar + name + sign out in sidebar footer

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

## Key Differences from Other Portals

| Feature | Admin Portal | Class Advisor Portal | Teacher Portal |
|---------|-------------|---------------------|----------------|
| **URL** | `/admin/*` | `/class-advisor/*` | `/teacher/*` |
| **Accent** | Blue | Purple | Emerald |
| **Sidebar** | Dark slate | Dark slate | Dark slate |
| **Access** | Admin users | Class advisors only | Teachers only |
| **Features** | Full system mgmt | Course assignments + outlines | Schedule + attendance |
| **Nav items** | 6+ sections | 4 focused pages | 4 focused pages |

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
