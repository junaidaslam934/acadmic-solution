'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { UserRole } from '@/types/auth';

const TABS: { id: UserRole; label: string; icon: string }[] = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'staff', label: 'Staff', icon: '👨‍🏫' },
  { id: 'class-advisor', label: 'Advisor', icon: '📋' },
  { id: 'coordinator', label: 'Coordinator', icon: '🔗' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Academic Solutions</span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-xs font-medium transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-blue-700 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="block text-base mb-0.5">{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div className="p-6">
            <LoginForm userRole={activeTab} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Need help? Contact your{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              system administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}