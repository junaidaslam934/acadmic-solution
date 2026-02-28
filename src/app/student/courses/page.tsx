'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseRegistration from '@/components/student/CourseRegistration';

export default function StudentCoursesPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get student ID from localStorage
    const id = localStorage.getItem('studentId');
    if (id) {
      setStudentId(id);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => router.push('/student/courses')}
              className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap"
            >
              My Courses
            </button>
            <button
              onClick={() => router.push('/student/attendance')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              📊 Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Course Registration</h1>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/student/login');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <CourseRegistration studentId={studentId} />
        </div>
      </div>
    </div>
  );
}
