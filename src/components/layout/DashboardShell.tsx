'use client';

import { useState } from 'react';
import Sidebar, { NavItem } from './Sidebar';

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeItem: string;
  onNavSelect: (id: string) => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DashboardShell({
  children,
  navItems,
  activeItem,
  onNavSelect,
  userName,
  userRole,
  onLogout,
  pageTitle,
  pageSubtitle,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (userName || '?')
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleColorMap: Record<string, string> = {
    admin: 'bg-red-700',
    teacher: 'bg-blue-600',
    student: 'bg-green-600',
    'class-advisor': 'bg-purple-600',
    coordinator: 'bg-orange-600',
  };
  const avatarColor = roleColorMap[userRole.toLowerCase()] ?? 'bg-red-700';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — off-canvas on mobile, static on md+ */}
      <div
        className={`fixed inset-y-0 left-0 z-30 md:static md:z-auto transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          navItems={navItems}
          activeItem={activeItem}
          onNavSelect={(id) => {
            onNavSelect(id);
            setMobileOpen(false);
          }}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 active:scale-95 transition-all duration-150 flex-shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb / page title */}
            <div className="min-w-0">
              {pageTitle && (
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{pageTitle}</h1>
              )}
              {pageSubtitle && (
                <p className="text-xs text-gray-500 hidden sm:block truncate">{pageSubtitle}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-95 transition-all duration-150"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User info */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <span className="hidden sm:block text-sm text-gray-600">
                <span className="font-medium text-gray-900">{userName}</span>
              </span>
              <div
                className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white`}
                title={`${userName} — ${userRole}`}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
