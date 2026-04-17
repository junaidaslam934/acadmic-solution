'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GradingLayout from '@/components/grading/GradingLayout';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
  credits: number;
}

interface CourseAssignment {
  _id: string;
  courseId: Course;
  year: number;
  semester: number;
  assessmentCount?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'courses', label: 'My Courses', icon: '📋' },
  { id: 'grading', label: 'Grade Students', icon: '📝' },
  { id: 'attendance', label: 'Mark Attendance', icon: '✅' },
  { id: 'chat', label: 'Messages', icon: '💬' },
];

export default function TeacherGradingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchTeacherCourses();
  }, [session, status, router]);

  const fetchTeacherCourses = async () => {
    try {
      if (!session?.user?.id) return;
      
      const response = await fetch(`/api/teacher/courses?teacherId=${session.user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (session?.user?.id) {
      fetchTeacherCourses();
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleNavSelect = (id: string) => {
    if (id === 'courses') router.push('/teacher/dashboard');
    if (id === 'attendance') router.push('/teacher/attendance');
    if (id === 'chat') router.push('/teacher/chat');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800"
          >
            Try Again
          </button>
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
      pageTitle="Grading System"
      pageSubtitle="CIS Academic Portal — Teacher"
    >
      <div className="max-w-5xl mx-auto">
        <GradingLayout
          assignments={assignments}
          onRefresh={handleRefresh}
        />
      </div>
    </DashboardShell>
  );
}