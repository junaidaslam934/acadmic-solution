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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Academic Solutions
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[80px] py-4 px-3 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 border-b-2 border-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
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
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}