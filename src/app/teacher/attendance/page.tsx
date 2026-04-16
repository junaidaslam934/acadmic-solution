'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AttendanceTracker from '@/components/teacher/AttendanceTracker';

export default function TeacherAttendancePage() {
  const { data: session, status } = useSession();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const router = useRouter();

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
    
    setTeacherId(session.user.id);
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (status === 'loading') {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'teacher') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => router.push('/teacher/dashboard')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              📋 My Courses
            </button>
            <button
              onClick={() => router.push('/teacher/attendance')}
              className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap"
            >
              ✅ Mark Attendance
            </button>
            <button
              onClick={() => router.push('/teacher/chat')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              💬 Messages
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Attendance Management</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          {teacherId && <AttendanceTracker teacherId={teacherId} />}
        </div>
      </div>
    </div>
  );
}
