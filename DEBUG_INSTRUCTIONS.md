# Debugging Course Assignment Issues

## Quick Steps to Debug

### 1. Check Database Content
Run this script to see what's actually in MongoDB:

```bash
npm run seed:teachers
```

This will show you how many teachers were added.

### 2. Check API Responses
Visit the debug page in your browser:

```
http://localhost:3000/admin/debug
```

This page will show:
- How many teachers the API returns
- How many courses the API returns
- All teacher and course details

### 3. Check Course Assignment Page
Visit the course assignment page:

```
http://localhost:3000/admin/courses
```

You should see:
- Debug info at the bottom showing how many teachers/courses loaded
- Year tabs (1-4)
- Teacher dropdown with all teachers
- Course dropdown with courses for selected year

## Common Issues

### No Teachers Showing
- Check `/admin/debug` - if teachers count is 0, run `npm run seed:teachers`
- Check browser console for errors
- Check that the Teacher model doesn't have unique email constraint

### No Courses Showing
- Check `/admin/debug` - if courses count is 0, run `npm run seed:dsa` to add a test course
- Courses are stored in `allcourses` collection, not `courses`
- The API checks both sources

### Teachers Not Appearing in Dropdown
- Even if email is the same, each teacher should have a unique `employeeId`
- Check `/admin/debug` to verify teachers are loading
- Check browser console for JavaScript errors

## Database Collections

- **teachers** - Mongoose collection (allows duplicate emails now)
- **allcourses** - Raw MongoDB collection (where courses are stored)
- **courseassignments** - Mongoose collection (where assignments are saved)

## Scripts

```bash
# Seed teachers (20 teachers with same email)
npm run seed:teachers

# Seed a test course
npm run seed:dsa

# Debug database content
tsx --env-file=.env.local scripts/debug-db.ts

# Fix teacher index (drop unique email constraint)
tsx --env-file=.env.local scripts/fix-teacher-index.ts
```
