'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClassAdvisorDashboard() {
  const [stats, setStats] = useState({ totalCourses: 0, totalAssignments: 0, totalPreferences: 0, totalTeachers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, assignmentsRes, preferencesRes, teachersRes] = await Promise.all([
        fetch('/api/courses'), fetch('/api/course-assignments'), fetch('/api/teacher-preferences'), fetch('/api/teachers'),
      ]);
      const [coursesData, assignmentsData, preferencesData, teachersData] = await Promise.all([
        coursesRes.json(), assignmentsRes.json(), preferencesRes.json(), teachersRes.json(),
      ]);
      setStats({
        totalCourses: coursesData.success ? coursesData.courses?.length || 0 : 0,
        totalAssignments: assignmentsData.success ? assignmentsData.assignments?.length || 0 : 0,
        totalPreferences: preferencesData.success ? preferencesData.preferences?.length || 0 : 0,
        totalTeachers: teachersData.success ? (teachersData.teachers?.length || 0) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    { label: 'Total Courses', value: stats.totalCourses, color: 'bg-purple-500', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Assignments', value: stats.totalAssignments, color: 'bg-blue-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Preferences', value: stats.totalPreferences, color: 'bg-amber-500', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { label: 'Teachers', value: stats.totalTeachers, color: 'bg-emerald-500', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{loading ? '–' : card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { href: '/class-advisor/assign-courses', label: 'Assign Courses', desc: 'Assign teachers to courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { href: '/class-advisor/review-outlines', label: 'Review Outlines', desc: 'Review submitted course outlines', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { href: '/class-advisor/teacher-preferences', label: 'Preferences', desc: 'Manage teacher preferences', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors group">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-4.5 h-4.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={action.icon} /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Your Responsibilities</h3>
          <ul className="space-y-2">
            {['Assign teachers to courses for all four years', 'Track and manage teacher course preferences', 'Ensure all courses have qualified instructors', 'Review and approve course outlines'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Tips</h3>
          <ul className="space-y-2">
            {['Set teacher preferences before making assignments', 'Preferred assignments are automatically flagged', 'You can reassign courses at any time', 'Check assignment summary for completion status'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
