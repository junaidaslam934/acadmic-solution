'use client';

import { useState } from 'react';
import { UserRole } from '@/types/auth';

interface LoginFormProps {
  userRole: UserRole;
}

export default function LoginForm({ userRole }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (userRole === 'student') {
      // Student login with ID only
      try {
        const response = await fetch('/api/auth/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: formData.email }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('studentId', data.student._id);
          localStorage.setItem('studentName', data.student.studentName);
          localStorage.setItem('rollNumber', data.student.rollNumber);
          localStorage.setItem('studentYear', data.student.year);
          localStorage.setItem('studentSection', data.student.section);
          window.location.href = '/student/courses';
        } else {
          setError(data.message || 'Login failed');
          setIsLoading(false);
        }
      } catch {
        setError('An error occurred. Please try again.');
        setIsLoading(false);
      }
    } else if (userRole === 'class-advisor') {
      // Class Advisor login with ID only
      try {
        const response = await fetch('/api/auth/class-advisor/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ advisorId: formData.email }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('classAdvisorId', data.advisor.id);
          localStorage.setItem('advisorYear', data.advisor.year.toString());
          localStorage.setItem('advisorName', data.advisor.teacherName);
          window.location.href = '/class-advisor/dashboard';
        } else {
          setError(data.message || 'Login failed');
          setIsLoading(false);
        }
      } catch {
        setError('An error occurred. Please try again.');
        setIsLoading(false);
      }
    } else if (userRole === 'teacher') {
      // Teacher/Staff login with ID only
      try {
        const response = await fetch('/api/auth/teacher/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId: formData.email }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('teacherId', data.teacher.id);
          localStorage.setItem('teacherName', data.teacher.name);
          localStorage.setItem('teacherEmail', data.teacher.email);
          window.location.href = '/teacher/dashboard';
        } else {
          setError(data.message || 'Login failed');
          setIsLoading(false);
        }
      } catch {
        setError('An error occurred. Please try again.');
        setIsLoading(false);
      }
    } else if (userRole === 'admin') {
      // Admin login with key only
      try {
        const response = await fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: formData.password }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('adminId', data.admin.id);
          localStorage.setItem('adminName', data.admin.name);
          localStorage.setItem('adminEmail', data.admin.email);
          localStorage.setItem('adminRole', data.admin.role);
          window.location.href = '/admin/dashboard';
        } else {
          setError(data.message || 'Login failed');
          setIsLoading(false);
        }
      } catch {
        setError('An error occurred. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getRoleSpecificPlaceholder = () => {
    switch (userRole) {
      case 'student':
        return 'Enter your Student ID';
      case 'teacher':
        return 'Enter your Teacher ID';
      case 'class-advisor':
        return 'Enter your Class Advisor ID';

      case 'admin':
        return 'Enter your Admin ID';
      default:
        return 'email@university.edu';
    }
  };

  const getFieldLabel = () => {
    if (userRole === 'student') return 'Student ID';
    if (userRole === 'class-advisor') return 'Class Advisor ID';
    if (userRole === 'teacher') return 'Teacher ID';

    if (userRole === 'admin') return 'Admin ID';
    return 'Email Address';
  };

  const getFieldType = () => {
    return (userRole === 'class-advisor' || userRole === 'teacher' || userRole === 'student' || userRole === 'admin') ? 'text' : 'email';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Inline error banner */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Role Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Signing in as {userRole === 'class-advisor' ? 'Class Advisor' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </div>
      </div>

      {/* ID/Email Field - Hidden for admin */}
      {userRole !== 'admin' && (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-teal-700 mb-1.5">
            👤 {getFieldLabel()}
          </label>
          <input
            id="email"
            name="email"
            type={getFieldType()}
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder={getRoleSpecificPlaceholder()}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors duration-200"
          />
          {(userRole === 'class-advisor' || userRole === 'teacher' || userRole === 'student') && (
            <p className="mt-1.5 text-xs text-gray-500">
              {`Example: ${userRole === 'class-advisor' ? '6942e61578335fab453721ae' : userRole === 'student' ? '6941cfd8f594c8e7c63aaf6b' : '6941cfd8f594c8e7c63aaf6b'}`}
            </p>
          )}
        </div>
      )}

      {/* Key/Password Field - For admin only */}
      {userRole === 'admin' && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-teal-700 mb-1.5">
            🔒 Key
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your key"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors duration-200"
          />
          <p className="mt-1.5 text-xs text-gray-500">Example: 12345678</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-700 hover:bg-red-800'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing in...
          </div>
        ) : (
          `Sign in as ${userRole === 'class-advisor' ? 'Class Advisor' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
        )}
      </button>

      {/* Additional Links */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="#" className="text-red-700 hover:text-red-600 font-medium">
            Contact administrator
          </a>
        </p>
      </div>
    </form>
  );
}
