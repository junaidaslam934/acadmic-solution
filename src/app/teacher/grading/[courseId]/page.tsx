'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import VerySimpleGrading from '@/components/grading/VerySimpleGrading';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { id: 'courses', label: 'My Courses', icon: '📋' },
  { id: 'grading', label: 'Grade Students', icon: '📝' },
  { id: 'attendance', label: 'Mark Attendance', icon: '✅' },
  { id: 'chat', label: 'Messages', icon: '💬' },
];

export default function CourseGradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.courseId as string; // This is actually the assignment ID

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'teacher') {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleNavSelect = (id: string) => {
    if (id === 'courses') router.push('/teacher/dashboard');
    if (id === 'grading') router.push('/teacher/grading');
    if (id === 'attendance') router.push('/teacher/attendance');
    if (id === 'chat') router.push('/teacher/chat');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeItem="grading"
      onNavSelect={handleNavSelect}
      userName={session?.user?.name || 'Teacher'}
      userRole="Teacher"
      onLogout={handleLogout}
      pageTitle="Grade Students"
      pageSubtitle="CIS Academic Portal — Teacher"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => router.push('/teacher/grading')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-red-700 transition-colors duration-150 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
        </div>
        <VerySimpleGrading assignmentId={assignmentId} />
      </div>
    </DashboardShell>
  );
}