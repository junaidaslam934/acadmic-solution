'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VerySimpleGrading from '@/components/grading/VerySimpleGrading';

export default function CourseGradingPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.courseId as string; // This is actually the assignment ID

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teacherId = localStorage.getItem('teacherId');
    
    if (!teacherId) {
      router.push('/login');
      return;
    }

    // Just set loading to false since we don't need to fetch course data separately
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/teacher/grading')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push('/teacher/grading')}
                  className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
                >
                  ← Back to Courses
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Grade Students
                </h1>
                <p className="mt-2 text-gray-600">
                  Enter sessional marks for your students
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VerySimpleGrading assignmentId={assignmentId} />
      </div>
    </div>
  );
}