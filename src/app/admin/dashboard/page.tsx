'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AddTeacherForm from '@/components/admin/AddTeacherForm';
import PDFUploadForm from '@/components/admin/PDFUploadForm';
import SemesterForm from '@/components/admin/SemesterForm';
import TimetableForm from '@/components/admin/TimetableForm';
import WeeksForm from '@/components/admin/WeeksForm';

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'teachers' | 'pdf' | 'semesters' | 'timetable' | 'weeks'>('teachers');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pdf' || tab === 'semesters' || tab === 'timetable' || tab === 'weeks') {
      setActiveTab(tab as 'pdf' | 'semesters' | 'timetable' | 'weeks');
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="mb-6 flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'teachers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Add Teachers
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'pdf'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setActiveTab('semesters')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'semesters'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Semesters
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'timetable'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Timetable
        </button>
        <button
          onClick={() => setActiveTab('weeks')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'weeks'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📆 Manage Weeks
        </button>
      </div>

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b bg-blue-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Add Teachers</h2>
          </div>
          
          <div className="p-6">
            <AddTeacherForm />
          </div>
        </div>
      )}

      {/* PDF Upload Tab */}
      {activeTab === 'pdf' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b bg-green-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Upload PDF Documents</h2>
            <p className="text-green-100 text-sm mt-1">Upload schedules, reports, or other documents</p>
          </div>
          
          <div className="p-6">
            <PDFUploadForm />
          </div>
        </div>
      )}

      {/* Semesters Tab */}
      {activeTab === 'semesters' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b bg-purple-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Manage Semesters</h2>
            <p className="text-purple-100 text-sm mt-1">Set semester start and end dates</p>
          </div>
          
          <div className="p-6">
            <SemesterForm />
          </div>
        </div>
      )}

      {/* Timetable Tab */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b bg-indigo-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Create Timetable</h2>
            <p className="text-indigo-100 text-sm mt-1">Schedule courses based on credit hours per week</p>
          </div>
          
          <div className="p-6">
            <TimetableForm />
          </div>
        </div>
      )}

      {/* Weeks Tab */}
      {activeTab === 'weeks' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b bg-orange-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Manage Semester Weeks</h2>
            <p className="text-orange-100 text-sm mt-1">Define start and end dates for each week (max 15 weeks)</p>
          </div>
          
          <div className="p-6">
            <WeeksFormWrapper />
          </div>
        </div>
      )}
    </div>
  );
}

function WeeksFormWrapper() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSemesters();
  }, []);

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
    return <div className="text-center py-8">Loading semesters...</div>;
  }

  if (semesters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No semesters found. Please create a semester first.
      </div>
    );
  }

  return (
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
  );
}
