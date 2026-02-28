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

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  planning: { label: 'Planning', cls: 'bg-slate-100 text-slate-700' },
  course_assignment: { label: 'Course Assignment', cls: 'bg-blue-100 text-blue-800' },
  outline_submission: { label: 'Outline Submission', cls: 'bg-amber-100 text-amber-800' },
  outline_review: { label: 'Outline Review', cls: 'bg-orange-100 text-orange-800' },
  scheduling: { label: 'Scheduling', cls: 'bg-violet-100 text-violet-800' },
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600' },
};

const STEPS = [
  { key: 'planning', label: 'Planning' },
  { key: 'course_assignment', label: 'Assign Courses' },
  { key: 'outline_submission', label: 'Outlines' },
  { key: 'outline_review', label: 'Review' },
  { key: 'scheduling', label: 'Scheduling' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ users: 0, semesters: 0, courses: 0, activeSemester: null });
  const [recent, setRecent] = useState<SemesterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [uRes, sRes, cRes] = await Promise.all([
          fetch('/api/users?limit=1').then(r => r.json()),
          fetch('/api/semesters').then(r => r.json()),
          fetch('/api/courses').then(r => r.json()),
        ]);
        const sems: SemesterSummary[] = sRes.data || sRes.semesters || [];
        const active = sems.find(s => s.status && s.status !== 'completed');
        setStats({
          users: uRes.pagination?.total || 0,
          semesters: sems.length,
          courses: Array.isArray(cRes.data) ? cRes.data.length : Array.isArray(cRes.courses) ? cRes.courses.length : 0,
          activeSemester: active || null,
        });
        setRecent(sems.slice(0, 5));
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading...
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Users', value: stats.users, href: '/admin/users', bg: 'bg-blue-600', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Semesters', value: stats.semesters, href: '/admin/semesters', bg: 'bg-violet-600', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Courses', value: stats.courses, href: '/admin/courses', bg: 'bg-emerald-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(c => (
          <a key={c.label} href={c.href} className="bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition flex items-center gap-4 group">
            <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={c.icon} /></svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Active semester workflow */}
      {stats.activeSemester && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{stats.activeSemester.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats.activeSemester.academicYear} &middot;{' '}
                {new Date(stats.activeSemester.startDate).toLocaleDateString()} &ndash;{' '}
                {new Date(stats.activeSemester.endDate).toLocaleDateString()}
              </p>
            </div>
            <Badge status={stats.activeSemester.status} />
          </div>
          <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
            {STEPS.map((step, i) => {
              const idx = STEPS.findIndex(s => s.key === stats.activeSemester!.status);
              const done = i < idx;
              const cur = i === idx;
              return (
                <div key={step.key} className="flex items-center flex-shrink-0">
                  <div className={`px-2.5 py-1 rounded text-[11px] font-semibold ${cur ? 'bg-blue-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {done && <span className="mr-1">&#10003;</span>}{step.label}
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-3 h-px mx-0.5 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent semesters */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Semesters</h2>
          <a href="/admin/semesters" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all &rarr;</a>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-slate-500 text-sm">No semesters yet.</p>
            <a href="/admin/semesters" className="inline-block mt-1 text-xs text-blue-600 hover:underline">Create one</a>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(sem => (
              <div key={sem._id} className="px-5 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{sem.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {sem.academicYear} &middot; {new Date(sem.startDate).toLocaleDateString()} &ndash; {new Date(sem.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge status={sem.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const s = STATUS_LABELS[status];
  return <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${s?.cls || 'bg-slate-100 text-slate-600'}`}>{s?.label || status || 'Unknown'}</span>;
}
