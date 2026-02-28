'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/teacher/dashboard', label: 'Dashboard', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { href: '/teacher/my-courses', label: 'My Courses', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { href: '/teacher/schedule', label: 'Schedule', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/teacher/attendance', label: 'Attendance', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
];

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [teacherName, setTeacherName] = useState('Teacher');

  useEffect(() => {
    setTeacherName(localStorage.getItem('userName') || localStorage.getItem('teacherName') || 'Teacher');
  }, []);

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-900 transform transition-transform duration-200 lg:translate-x-0 lg:static ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center px-5 border-b border-slate-700/50">
            <Link href="/teacher/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <span className="font-semibold text-white text-sm">Teacher Portal</span>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2.5 px-2 mb-2">
              <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-[11px] font-bold text-slate-300">{teacherName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{teacherName}</p>
                <p className="text-[10px] text-slate-500">Teacher</p>
              </div>
            </div>
            <button onClick={logout} className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors">Sign out</button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-10">
          <button onClick={() => setOpen(!open)} className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-sm font-semibold text-slate-800">{NAV.find((i) => pathname.startsWith(i.href))?.label || 'Teacher'}</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
