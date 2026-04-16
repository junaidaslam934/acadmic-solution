'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/class-advisor/dashboard', label: 'Dashboard' },
  { href: '/class-advisor/assign-courses', label: 'Assign Courses' },
  { href: '/class-advisor/teacher-preferences', label: '⭐ Teacher Preferences' },
];

export default function ClassAdvisorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoginPage =
    pathname === '/class-advisor/login' ||
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
      {/* Mobile nav drawer overlay */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative z-10 bg-white w-64 max-w-full h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-purple-600">
              <span className="text-white font-semibold">Navigation</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="text-white/80 hover:text-white p-1"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-3 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center px-5 py-3.5 text-sm font-medium border-l-4 transition-all duration-150 ${
                    pathname === item.href
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-transparent text-gray-600 hover:border-purple-300 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transition-all duration-150 flex-shrink-0"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-purple-600 truncate">Class Advisor Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Course &amp; Teacher Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="hidden sm:block text-sm text-gray-500">
                Welcome,{' '}
                {typeof window !== 'undefined'
                  ? localStorage.getItem('advisorName') || 'Advisor'
                  : 'Advisor'}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 active:scale-95 transition-all duration-150 text-sm font-medium shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 border-t border-gray-200 pt-2 -mb-px">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap active:scale-95 ${
                  pathname === item.href
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50/50'
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
