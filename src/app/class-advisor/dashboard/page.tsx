'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';

export default function ClassAdvisorDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    totalPreferences: 0,
    totalTeachers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [coursesRes, assignmentsRes, preferencesRes, teachersRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/course-assignments'),
        fetch('/api/teacher-preferences'),
        fetch('/api/teachers'),
      ]);

      const coursesData = await coursesRes.json();
      const assignmentsData = await assignmentsRes.json();
      const preferencesData = await preferencesRes.json();
      const teachersData = await teachersRes.json();

      setStats({
        totalCourses: coursesData.success ? coursesData.courses.length : 0,
        totalAssignments: assignmentsData.success ? assignmentsData.assignments.length : 0,
        totalPreferences: preferencesData.success ? preferencesData.preferences.length : 0,
        totalTeachers: teachersData.success ? (teachersData.data?.length || teachersData.count || 0) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Welcome to Class Advisor Portal"
        subtitle="Manage course assignments and teacher preferences efficiently"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Courses"
          value={stats.totalCourses}
          borderColor="border-purple-600"
          icon={
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <StatCard
          label="Assignments"
          value={stats.totalAssignments}
          borderColor="border-blue-600"
          icon={<span>✅</span>}
        />
        <StatCard
          label="Preferences"
          value={stats.totalPreferences}
          borderColor="border-yellow-600"
          icon={<span>⭐</span>}
        />
        <StatCard
          label="Teachers"
          value={stats.totalTeachers}
          borderColor="border-green-600"
          icon={
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/class-advisor/assign-courses"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
          >
            <div className="text-3xl mr-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Assign Courses</h4>
              <p className="text-sm text-gray-600">Assign teachers to courses for all years</p>
            </div>
          </Link>

          <Link
            href="/class-advisor/teacher-preferences"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
          >
            <div className="text-3xl mr-4">⭐</div>
            <div>
              <h4 className="font-semibold text-gray-900">Teacher Preferences</h4>
              <p className="text-sm text-gray-600">Manage teacher course preferences</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">📋 Your Responsibilities</h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Assign teachers to courses for all four years</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Track and manage teacher course preferences</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure all courses have qualified instructors</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Monitor assignment completion status</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Set teacher preferences before making assignments</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Preferred assignments are automatically flagged</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You can reassign courses at any time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check assignment summary for completion status</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
