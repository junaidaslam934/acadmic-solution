'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NextAuthLoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher' | 'class-advisor' | 'staff' | 'admin'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid credentials. Please check your email/ID and password.');
      } else {
        // Store role in localStorage for client-side route protection
        localStorage.setItem('userRole', formData.role);
        
        // Redirect based on role
        switch (formData.role) {
          case 'teacher':
            router.push('/teacher/dashboard');
            break;
          case 'class-advisor':
            router.push('/teacher/dashboard'); // Class advisors use teacher dashboard
            break;
          case 'staff':
            router.push('/staff/dashboard'); // Staff has their own dashboard
            break;
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-700">
            <span className="text-white font-bold text-xl">CIS</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            NED University - Computer & Information Systems Engineering
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="class-advisor">Class Advisor</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {formData.role === 'teacher' || formData.role === 'class-advisor' || formData.role === 'staff' ? 'Email or Employee ID' : 'Email or Student ID'}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={formData.role === 'teacher' || formData.role === 'class-advisor' ? 'Email or Employee ID' : 'Email or Student ID'}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Demo Credentials:</p>
              <p><strong>Teacher:</strong> ja8886288@gmail.com or T001 / qwerty</p>
              <p><strong>Class Advisor:</strong> ja8886288@gmail.com or T001 / qwerty</p>
              <p><strong>Admin:</strong> ja8886288@gmail.com or T001 / qwerty (if in class advisors)</p>
              <p><strong>Student:</strong> Any student email/ID / qwerty</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}