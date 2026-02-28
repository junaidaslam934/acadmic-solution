'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WeeksForm from '@/components/admin/WeeksForm';

interface Semester {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function WeeksPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      router.push('/login');
      return;
    }
    fetchSemesters();
  }, [router]);

  const fetchSemesters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/semesters');
      const data = await response.json();
      if (data.success) {
        setSemesters(data.semesters);
        if (data.semesters.length > 0) {
          setSelectedSemester(data.semesters[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => router.push('/admin/dashboard?tab=teachers')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Add Teachers
            </button>
            <button
              onClick={() => router.push('/admin/dashboard?tab=pdf')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Upload PDF
            </button>
            <button
              onClick={() => router.push('/admin/dashboard?tab=semesters')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Manage Semesters
            </button>
            <button
              onClick={() => router.push('/admin/dashboard?tab=timetable')}
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              📅 Timetable
            </button>
            <button
              onClick={() => router.push('/admin/weeks')}
              className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap"
            >
              📆 Manage Weeks
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Manage Semester Weeks</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

        {semesters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No semesters found. Please create a semester first.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map((sem) => (
                  <option key={sem._id} value={sem._id}>
                    {sem.name} ({new Date(sem.startDate).toLocaleDateString()} -{' '}
                    {new Date(sem.endDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedSemester && (
              <WeeksForm semesterId={selectedSemester} onSuccess={fetchSemesters} />
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
