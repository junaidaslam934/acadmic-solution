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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`fixed inset-y-0 left-0 z-30 md:static md:z-auto transition-transform duration-300 ${
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
        {/* Top header bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              {pageTitle && (
                <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
              )}
              {pageSubtitle && (
                <p className="text-xs text-gray-500">{pageSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              Welcome, <span className="font-medium text-gray-900">{userName}</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
              {(userName || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
