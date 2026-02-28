'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
  { href: '/admin/students', label: 'Students', icon: '🎓' },
  { href: '/admin/courses', label: 'Courses', icon: '📚' },
  { href: '/admin/class-advisors', label: 'Class Advisors', icon: '📋' },
  { href: '/admin/dashboard?tab=pdf', label: 'PDF Upload', icon: '📄' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    if (name) setAdminName(name);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Still clear local state even if API fails
    }
    // Clear all localStorage auth data
    ['adminId', 'adminName', 'adminEmail', 'adminRole', 'authToken'].forEach((k) =>
      localStorage.removeItem(k)
    );
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-bold">
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{adminName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px overflow-x-auto pb-px">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin/dashboard?tab=pdf'
                  ? pathname === '/admin/dashboard' && typeof window !== 'undefined' && window.location.search.includes('tab=pdf')
                  : pathname === item.href || (item.href === '/admin/dashboard' && pathname === '/admin/dashboard' && !(typeof window !== 'undefined' && window.location.search.includes('tab=pdf')));

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'text-blue-700 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">{children}</main>
    </div>
  );
}
