'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'attendance', label: 'Attendance', icon: '📊' },
  { id: 'grades', label: 'Grades', icon: '🎓' },
  { id: 'chat', label: 'Messages', icon: '💬' },
];

export default function StudentChatPage() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    const studentName = localStorage.getItem('studentName');

    if (!studentId || !studentName) {
      router.push('/login');
      return;
    }

    setStudentData({ id: studentId, name: studentName });
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the chat system.</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleNavSelect = (id: string) => {
    if (id === 'courses') router.push('/student/courses');
    if (id === 'attendance') router.push('/student/attendance');
    if (id === 'grades') router.push('/student/grades');
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeItem="chat"
      onNavSelect={handleNavSelect}
      userName={studentData.name}
      userRole="Student"
      onLogout={handleLogout}
      pageTitle="Messages"
      pageSubtitle="CIS Academic Portal — Student"
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ChatLayout
            userId={studentData.id}
            userRole="student"
            userName={studentData.name}
          />
        </div>
      </div>
    </DashboardShell>
  );
}