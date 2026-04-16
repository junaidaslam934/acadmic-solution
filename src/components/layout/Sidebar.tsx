'use client';

import { useState } from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  activeItem: string;
  onNavSelect: (id: string) => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function Sidebar({
  navItems,
  activeItem,
  onNavSelect,
  userName,
  userRole,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const initials = (userName || '?')
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className={`flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen flex-shrink-0 shadow-xl`}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/60">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">CIS</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">CIS Portal</div>
              <div className="text-xs text-slate-400 truncate">NED University</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center mx-auto shadow-sm">
            <span className="text-white text-xs font-bold">CIS</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200 active:scale-95 ${
            collapsed ? 'ml-auto mt-2 block' : ''
          }`}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden
                  ${isActive
                    ? 'bg-red-600/20 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-white active:scale-[0.98]'
                  }`}
              >
                {/* Active pill indicator */}
                {isActive && (
                  <span className="absolute left-0 inset-y-2 w-1 bg-red-500 rounded-r-full" />
                )}

                {/* Hover glow background */}
                <span
                  className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
                    isActive
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100 bg-slate-700/40'
                  }`}
                />

                <span className={`text-base flex-shrink-0 relative z-10 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="truncate relative z-10 flex-1 text-left">{item.label}</span>
                )}

                {/* Badge */}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="relative z-10 ml-auto flex-shrink-0 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User info + logout */}
      <div className="border-t border-slate-700/60 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/60 transition-colors duration-200 group mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-400 capitalize">{userRole}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shadow-sm" title={userName}>
              {initials}
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200 active:scale-[0.98] group"
        >
          <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
