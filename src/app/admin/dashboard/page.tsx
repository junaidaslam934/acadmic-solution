'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AddTeacherForm from '@/components/admin/AddTeacherForm';
import PDFUploadForm from '@/components/admin/PDFUploadForm';
import SemesterForm from '@/components/admin/SemesterForm';
import TimetableForm from '@/components/admin/TimetableForm';
import WeeksForm from '@/components/admin/WeeksForm';

type DashboardTab = 'teachers' | 'pdf' | 'semesters' | 'timetable' | 'weeks';

const DASHBOARD_TABS: { id: DashboardTab; label: string; icon: string; color: string }[] = [
  { id: 'teachers', label: 'Add Teachers', icon: '👨‍🏫', color: 'blue' },
  { id: 'pdf', label: 'Upload PDF', icon: '📄', color: 'emerald' },
  { id: 'semesters', label: 'Semesters', icon: '📅', color: 'purple' },
  { id: 'timetable', label: 'Timetable', icon: '🕐', color: 'indigo' },
  { id: 'weeks', label: 'Weeks', icon: '📆', color: 'amber' },
];

const TAB_HEADER_STYLES: Record<string, string> = {
  blue: 'from-blue-600 to-blue-700',
  emerald: 'from-emerald-600 to-emerald-700',
  purple: 'from-purple-600 to-purple-700',
  indigo: 'from-indigo-600 to-indigo-700',
  amber: 'from-amber-500 to-amber-600',
};

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading dashboard...
          </div>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardTab>('teachers');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && DASHBOARD_TABS.some((t) => t.id === tab)) {
      setActiveTab(tab as DashboardTab);
    }
  }, [searchParams]);

  const currentTab = DASHBOARD_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${TAB_HEADER_STYLES[currentTab.color]} px-6 py-4`}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>{currentTab.icon}</span>
            {currentTab.label}
          </h2>
        </div>
        <div className="p-6">
          {activeTab === 'teachers' && <AddTeacherForm />}
          {activeTab === 'pdf' && <PDFUploadForm />}
          {activeTab === 'semesters' && <SemesterForm />}
          {activeTab === 'timetable' && <TimetableForm />}
          {activeTab === 'weeks' && <WeeksFormWrapper />}
        </div>
      </div>
    </div>
  );
}

function WeeksFormWrapper() {
  const [semesters, setSemesters] = useState<Array<{ _id: string; name: string; startDate: string; endDate: string }>>([]);
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading semesters...
        </div>
      </div>
    );
  }

  if (semesters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-1">No semesters found</p>
        <p className="text-sm text-gray-400">Create a semester first in the Semesters tab.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Semester
        </label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
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
