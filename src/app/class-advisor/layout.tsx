'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClassAdvisorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't show header on login page
  const isLoginPage = pathname === '/class-advisor/login' || 
                      pathname === '/class-advisor/forgot-password' || 
                      pathname === '/class-advisor/reset-password';

  const handleLogout = () => {
    localStorage.removeItem('classAdvisorId');
    localStorage.removeItem('advisorYear');
    localStorage.removeItem('advisorName');
    router.push('/class-advisor/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">Class Advisor Portal</h1>
              <p className="text-sm text-gray-600">Course & Teacher Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {typeof window !== 'undefined' ? localStorage.getItem('advisorName') || 'Advisor' : 'Advisor'}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 border-t border-gray-200 pt-2 -mb-px">
            <Link
              href="/class-advisor/dashboard"
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                pathname === '/class-advisor/dashboard'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/class-advisor/assign-courses"
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                pathname === '/class-advisor/assign-courses'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Assign Courses
            </Link>
            <Link
              href="/class-advisor/teacher-preferences"
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                pathname === '/class-advisor/teacher-preferences'
                  ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ⭐ Teacher Preferences
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
