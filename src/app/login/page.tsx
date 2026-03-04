'use client';

import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { UserRole } from '@/types/auth';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('student');

  const tabs = [
    { id: 'student' as UserRole, label: 'Student', icon: '🎓' },
    { id: 'staff' as UserRole, label: 'Staff', icon: '👨‍🏫' },
    { id: 'class-advisor' as UserRole, label: 'Advisor', icon: '📋' },
    { id: 'coordinator' as UserRole, label: 'Coordinator', icon: '🔗' },
    { id: 'admin' as UserRole, label: 'Admin', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Top banner */}
        <div className="bg-red-800 text-white text-center py-3 px-6 rounded-t-2xl">
          <h1 className="text-xl font-bold tracking-wide">CIS Academic Portal</h1>
          <p className="text-red-200 text-xs mt-0.5">
            Department of Computer &amp; Information Systems Engineering
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[70px] py-3 px-2 text-xs font-medium flex flex-col items-center gap-0.5 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-red-700 border-b-2 border-red-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div className="p-8">
            <LoginForm userRole={activeTab} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            For registration issues, contact{' '}
            <a href="#" className="text-red-400 hover:text-red-300">
              admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}