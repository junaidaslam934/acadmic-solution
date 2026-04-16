'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'attendance', label: 'Attendance', icon: '📊' },
  { id: 'grades', label: 'Grades', icon: '🎓' },
  { id: 'chat', label: 'Messages', icon: '💬' },
];

interface Grade {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
  section: string;
  sessionalMarks: number;
  totalMarks: number;
  comments?: string;
  gradedAt: string;
}

export default function StudentGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'student') {
      router.push('/login');
      return;
    }

    setStudentName(session.user.name || 'Student');
    fetchGrades(session.user.id);
  }, [session, status, router]);

  const fetchGrades = async (studentId: string) => {
    try {
      const response = await fetch(`/api/grading/simple/student/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      setGrades(data.grades || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const handleNavSelect = (id: string) => {
    if (id === 'courses') router.push('/student/courses');
    if (id === 'attendance') router.push('/student/attendance');
    if (id === 'chat') router.push('/student/chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Grades</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 active:scale-95 transition-all duration-150"
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
      activeItem="grades"
      onNavSelect={handleNavSelect}
      userName={studentName}
      userRole="Student"
      onLogout={handleLogout}
      pageTitle="My Sessional Marks"
      pageSubtitle="CIS Academic Portal — Student"
    >
      <div className="max-w-5xl mx-auto">
        {grades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16 px-6">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Grades Yet</h3>
            <p className="text-gray-600">
              Your sessional marks will appear here once your teachers have graded you.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Sessional Marks</h2>
              <p className="text-sm text-gray-600 mt-1">
                {grades.length} course{grades.length !== 1 ? 's' : ''} graded
              </p>
            </div>

            {/* Responsive table wrapper */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Year / Sem
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Section
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Comments
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => {
                    const pct = grade.totalMarks > 0
                      ? Math.round((grade.sessionalMarks / grade.totalMarks) * 100)
                      : 0;
                    const markColor =
                      pct >= 80 ? 'text-green-700' : pct >= 50 ? 'text-yellow-700' : 'text-red-700';
                    return (
                      <tr key={grade._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{grade.courseCode}</div>
                          <div className="text-xs text-gray-500">{grade.courseName}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">Y{grade.year} S{grade.semester}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">§ {grade.section}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${markColor}`}>
                            {grade.sessionalMarks}/{grade.totalMarks}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">({pct}%)</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {grade.comments || '—'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-500">
                            {new Date(grade.gradedAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}