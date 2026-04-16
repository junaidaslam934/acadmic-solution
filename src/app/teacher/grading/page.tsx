'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GradingLayout from '@/components/grading/GradingLayout';

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Grading System</h1>
            <p className="mt-2 text-gray-600">
              Manage assessments and grade students for your assigned courses
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GradingLayout 
          assignments={assignments}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}