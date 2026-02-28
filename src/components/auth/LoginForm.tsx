'use client';

import { useState } from 'react';
import { UserRole } from '@/types/auth';

interface LoginFormProps {
  userRole: UserRole;
}

// Centralized config per role
const ROLE_CONFIG: Record<UserRole, {
  fieldLabel: string;
  fieldName: string;
  placeholder: string;
  hint?: string;
  apiUrl: string;
  bodyKey: string;
  responseKey: string;
  redirect: string;
  storageMap: (data: any) => Record<string, string>;
  usePasswordField?: boolean;
}> = {
  student: {
    fieldLabel: 'Student ID or Roll Number',
    fieldName: 'email',
    placeholder: 'Enter your Student ID or Roll Number',
    hint: 'e.g., 6941cfd8f594c8e7c63aaf6b or CS-2023-001',
    apiUrl: '/api/auth/student/login',
    bodyKey: 'studentId',
    responseKey: 'student',
    redirect: '/student/courses',
    storageMap: (d) => ({
      studentId: d._id,
      studentName: d.studentName,
      rollNumber: d.rollNumber,
      studentYear: String(d.year),
      studentSection: d.section,
    }),
  },
  staff: {
    fieldLabel: 'Teacher ID',
    fieldName: 'email',
    placeholder: 'Enter your Teacher ID',
    hint: 'e.g., 6941cfd8f594c8e7c63aaf6b',
    apiUrl: '/api/auth/teacher/login',
    bodyKey: 'teacherId',
    responseKey: 'teacher',
    redirect: '/teacher/dashboard',
    storageMap: (d) => ({
      teacherId: d.id,
      teacherName: d.name,
      teacherEmail: d.email,
    }),
  },
  'class-advisor': {
    fieldLabel: 'Class Advisor ID',
    fieldName: 'email',
    placeholder: 'Enter your Class Advisor ID',
    hint: 'e.g., 6942e61578335fab453721ae',
    apiUrl: '/api/auth/class-advisor/login',
    bodyKey: 'advisorId',
    responseKey: 'advisor',
    redirect: '/class-advisor/dashboard',
    storageMap: (d) => ({
      classAdvisorId: d.id,
      advisorYear: String(d.year),
      advisorName: d.teacherName,
    }),
  },
  coordinator: {
    fieldLabel: 'Coordinator ID',
    fieldName: 'email',
    placeholder: 'Enter your Coordinator ID',
    hint: 'e.g., 6941cfd8f594c8e7c63aaf6b',
    apiUrl: '/api/auth/coordinator/login',
    bodyKey: 'coordinatorId',
    responseKey: 'coordinator',
    redirect: '/coordinator/dashboard',
    storageMap: (d) => ({
      coordinatorId: d.id,
      coordinatorName: d.name,
      coordinatorEmail: d.email,
    }),
  },
  admin: {
    fieldLabel: 'Admin Key',
    fieldName: 'password',
    placeholder: 'Enter your admin key',
    apiUrl: '/api/auth/admin/login',
    bodyKey: 'key',
    responseKey: 'admin',
    redirect: '/admin/dashboard',
    usePasswordField: true,
    storageMap: (d) => ({
      adminId: d.id,
      adminName: d.name,
      adminEmail: d.email,
      adminRole: d.role,
    }),
  },
};

export default function LoginForm({ userRole }: LoginFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const config = ROLE_CONFIG[userRole];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.bodyKey]: inputValue }),
      });

      const data = await response.json();

      if (data.success) {
        // Store role data in localStorage for client-side display
        const storageEntries = config.storageMap(data[config.responseKey]);
        Object.entries(storageEntries).forEach(([k, v]) => localStorage.setItem(k, v));
        // Store the token for client-side API calls
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        window.location.href = config.redirect;
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const roleLabel = userRole === 'class-advisor'
    ? 'Class Advisor'
    : userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Role Badge */}
      <div className="text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          Signing in as {roleLabel}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input Field */}
      <div>
        <label htmlFor="loginInput" className="block text-sm font-medium text-gray-700 mb-1.5">
          {config.fieldLabel}
        </label>
        <input
          id="loginInput"
          type={config.usePasswordField ? 'password' : 'text'}
          required
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(''); }}
          placeholder={config.placeholder}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm bg-gray-50 focus:bg-white"
          autoComplete={config.usePasswordField ? 'current-password' : 'off'}
        />
        {config.hint && (
          <p className="mt-1.5 text-xs text-gray-400">{config.hint}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className={`w-full py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all duration-200 ${
          isLoading || !inputValue.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          `Sign in as ${roleLabel}`
        )}
      </button>

      {/* Forgot password */}
      {userRole === 'admin' && (
        <div className="text-center">
          <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
            Forgot your key?
          </a>
        </div>
      )}
    </form>
  );
}
