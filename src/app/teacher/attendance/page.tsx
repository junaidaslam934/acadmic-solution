'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceTracker from '@/components/teacher/AttendanceTracker';

export default function TeacherAttendancePage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get teacher ID from localStorage
    const id = localStorage.getItem('teacherId');
    if (id) {
      setTeacherId(id);
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!teacherId) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Attendance Management</h1>
          <button
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <AttendanceTracker teacherId={teacherId} />
      </div>
    </div>
  );
}
