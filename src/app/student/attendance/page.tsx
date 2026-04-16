'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceView from '@/components/student/AttendanceView';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'attendance', label: 'Attendance', icon: '📊' },
  { id: 'grades', label: 'Grades', icon: '🎓' },
  { id: 'chat', label: 'Messages', icon: '💬' },
];

export default function StudentAttendancePage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('Student');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem('studentId');
    const name = localStorage.getItem('studentName');
    if (id) {
      setStudentId(id);
      if (name) setStudentName(name);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!studentId) {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleNavSelect = (id: string) => {
    if (id === 'courses') router.push('/student/courses');
    if (id === 'grades') router.push('/student/grades');
    if (id === 'chat') router.push('/student/chat');
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeItem="attendance"
      onNavSelect={handleNavSelect}
      userName={studentName}
      userRole="Student"
      onLogout={handleLogout}
      pageTitle="My Attendance"
      pageSubtitle="CIS Academic Portal — Student"
    >
      <div className="max-w-4xl mx-auto">
        <AttendanceView studentId={studentId} />
      </div>
    </DashboardShell>
  );
}
