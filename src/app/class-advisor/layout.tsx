'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { href: '/class-advisor/dashboard', label: 'Dashboard', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { href: '/class-advisor/assign-courses', label: 'Assign Courses', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { href: '/class-advisor/review-outlines', label: 'Review Outlines', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/class-advisor/teacher-preferences', label: 'Preferences', d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
];

export default function ClassAdvisorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [advisorName, setAdvisorName] = useState('Advisor');
  const [advisorYear, setAdvisorYear] = useState('');

  const isAuth = pathname === '/class-advisor/login' || pathname.includes('/forgot-password') || pathname.includes('/reset-password');

  useEffect(() => {
    if (!isAuth) {
      setAdvisorName(localStorage.getItem('userName') || localStorage.getItem('advisorName') || 'Advisor');
      setAdvisorYear(localStorage.getItem('advisorYear') || '');
    }
  }, [isAuth]);

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    localStorage.clear();
    router.push('/login');
  };

  if (isAuth) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-900 transform transition-transform duration-200 lg:translate-x-0 lg:static ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center px-5 border-b border-slate-700/50">
            <Link href="/class-advisor/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">CA</span>
              </div>
              <span className="font-semibold text-white text-sm">Class Advisor</span>
            </Link>
          </div>
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${active ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2.5 px-2 mb-2">
              <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-[11px] font-bold text-slate-300">{advisorName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{advisorName}</p>
                <p className="text-[10px] text-slate-500">Advisor{advisorYear ? ` · Year ${advisorYear}` : ''}</p>
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
          <h1 className="text-sm font-semibold text-slate-800">{NAV.find((i) => pathname.startsWith(i.href))?.label || 'Class Advisor'}</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
