'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', tab: null },
  { href: '/admin/teachers', label: 'Teachers', tab: null },
  { href: '/admin/students', label: 'Students', tab: null },
  { href: '/admin/courses', label: 'Course Assignments', tab: null },
  { href: '/admin/class-advisors', label: 'Class Advisors', tab: null },
  { href: '/admin/dashboard?tab=pdf', label: '📄 PDF Upload', tab: 'pdf' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const isActive = (item: { href: string; tab: string | null }) => {
    const itemPath = item.href.split('?')[0];
    if (item.tab) {
      return pathname === itemPath && currentTab === item.tab;
    }
    return pathname === itemPath && !currentTab;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Academic Solutions Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, Admin</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 border-t border-gray-200 pt-2 -mb-px overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  isActive(item)
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
