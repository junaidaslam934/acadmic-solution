'use client';

import { useState } from 'react';

const ROLE_REDIRECTS: Record<string, string> = {
  admin: '/admin/dashboard',
  chairman: '/admin/dashboard',
  co_chairman: '/admin/dashboard',
  ug_coordinator: '/coordinator/dashboard',
  class_advisor: '/class-advisor/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/courses',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const user = data.user;
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);
      if (user.teacherId) localStorage.setItem('teacherId', user.teacherId);
      if (user.advisorYear) localStorage.setItem('advisorYear', String(user.advisorYear));
      if (data.token) localStorage.setItem('authToken', data.token);

      if (user.role === 'admin' || user.role === 'chairman' || user.role === 'co_chairman') {
        localStorage.setItem('adminId', user.id);
        localStorage.setItem('adminName', user.name);
      }
      if (user.role === 'teacher' || user.role === 'class_advisor') {
        localStorage.setItem('teacherName', user.name);
      }
      if (user.role === 'class_advisor') {
        localStorage.setItem('classAdvisorId', user.id);
        localStorage.setItem('advisorName', user.name);
      }

      window.location.href = ROLE_REDIRECTS[user.role] || '/';
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Academic Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-900/40 border border-red-800 rounded-md text-sm text-red-300">{error}</div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border border-slate-600 rounded-md text-sm bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-slate-600 rounded-md text-sm bg-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-xs text-slate-400 hover:text-blue-400 font-medium transition">Forgot password?</a>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate-600">
          Need an account? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}
