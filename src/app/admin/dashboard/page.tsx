'use client';

import { useState, useEffect } from 'react';

interface SemesterSummary {
  _id: string;
  name: string;
  academicYear: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface DashboardStats {
  users: number;
  semesters: number;
  courses: number;
  activeSemester: SemesterSummary | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'bg-gray-100 text-gray-700' },
  course_assignment: { label: 'Course Assignment', color: 'bg-blue-100 text-blue-700' },
  outline_submission: { label: 'Outline Submission', color: 'bg-yellow-100 text-yellow-700' },
  outline_review: { label: 'Outline Review', color: 'bg-orange-100 text-orange-700' },
  scheduling: { label: 'Scheduling', color: 'bg-purple-100 text-purple-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
};

const WORKFLOW_STEPS = [
  { key: 'planning', label: 'Planning' },
  { key: 'course_assignment', label: 'Assign Courses' },
  { key: 'outline_submission', label: 'Outline Submission' },
  { key: 'outline_review', label: 'Outline Review' },
  { key: 'scheduling', label: 'Scheduling' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    semesters: 0,
    courses: 0,
    activeSemester: null,
  });
  const [recentSemesters, setRecentSemesters] = useState<SemesterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, semestersRes, coursesRes] = await Promise.all([
        fetch('/api/users?limit=1').then((r) => r.json()),
        fetch('/api/semesters').then((r) => r.json()),
        fetch('/api/courses').then((r) => r.json()),
      ]);

      const semesters: SemesterSummary[] = semestersRes.data || semestersRes.semesters || [];
      const activeSem = semesters.find(
        (s: SemesterSummary) => s.status && s.status !== 'completed'
      );

      setStats({
        users: usersRes.pagination?.total || 0,
        semesters: semesters.length,
        courses: Array.isArray(coursesRes.data)
          ? coursesRes.data.length
          : Array.isArray(coursesRes.courses)
            ? coursesRes.courses.length
            : 0,
        activeSemester: activeSem || null,
      });
      setRecentSemesters(semesters.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Users"
          value={stats.users}
          href="/admin/users"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="blue"
        />
        <StatCard
          label="Semesters"
          value={stats.semesters}
          href="/admin/semesters"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="purple"
        />
        <StatCard
          label="Courses"
          value={stats.courses}
          href="/admin/courses"
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          color="emerald"
        />
      </div>

      {/* Active semester workflow */}
      {stats.activeSemester && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {stats.activeSemester.name}
              </h2>
              <p className="text-sm text-gray-500">
                {stats.activeSemester.academicYear} &middot;{' '}
                {new Date(stats.activeSemester.startDate).toLocaleDateString()} &ndash;{' '}
                {new Date(stats.activeSemester.endDate).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[stats.activeSemester.status]?.color || 'bg-gray-100 text-gray-600'}`}
            >
              {STATUS_LABELS[stats.activeSemester.status]?.label || stats.activeSemester.status}
            </span>
          </div>

          {/* Workflow stepper */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {WORKFLOW_STEPS.map((step, i) => {
              const stepIdx = WORKFLOW_STEPS.findIndex(
                (s) => s.key === stats.activeSemester!.status
              );
              const isDone = i < stepIdx;
              const isCurrent = i === stepIdx;
              return (
                <div key={step.key} className="flex items-center flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone && (
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {step.label}
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div
                      className={`w-4 h-0.5 mx-0.5 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent semesters */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Semesters</h2>
          <a
            href="/admin/semesters"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all &rarr;
          </a>
        </div>
        {recentSemesters.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No semesters created yet.</p>
            <a
              href="/admin/semesters"
              className="inline-block mt-2 text-sm text-blue-600 hover:underline"
            >
              Create your first semester
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentSemesters.map((sem) => (
              <div key={sem._id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sem.name}</p>
                  <p className="text-xs text-gray-500">
                    {sem.academicYear} &middot;{' '}
                    {new Date(sem.startDate).toLocaleDateString()} &ndash;{' '}
                    {new Date(sem.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[sem.status]?.color || 'bg-gray-100 text-gray-600'}`}
                >
                  {STATUS_LABELS[sem.status]?.label || sem.status || 'Planning'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
  color,
}: {
  label: string;
  value: number;
  href: string;
  icon: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <a
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow flex items-center gap-4"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </a>
  );
}
