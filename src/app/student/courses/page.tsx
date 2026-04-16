'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseRegistration from '@/components/student/CourseRegistration';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'attendance', label: 'Attendance', icon: '📊' },
  { id: 'grades', label: 'Grades', icon: '🎓' },
  { id: 'chat', label: 'Messages', icon: '💬' },
];

export default function StudentCoursesPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get student ID from localStorage
    const id = localStorage.getItem('studentId');
    const name = localStorage.getItem('studentName');
    if (id) {
      setStudentId(id);
      if (name) setStudentName(name);
    } else {
      // Redirect to login if not authenticated
      router.push('/student/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!studentId) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    localStorage.clear();
    router.push('/student/login');
  };

  const handleNavSelect = (id: string) => {
    if (id === 'attendance') router.push('/student/attendance');
    if (id === 'grades') router.push('/student/grades');
    if (id === 'chat') router.push('/student/chat');
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeItem="courses"
      onNavSelect={handleNavSelect}
      userName={studentName}
      userRole="Student"
      onLogout={handleLogout}
      pageTitle="Course Registration"
      pageSubtitle="CIS Academic Portal — Student"
    >
      <CourseRegistration studentId={studentId} />
    </DashboardShell>
  );
}
