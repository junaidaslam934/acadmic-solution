'use client';

import StudentLoginForm from '@/components/auth/StudentLoginForm';

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Academic Portal</h1>
          <p className="text-gray-600">Student Course Registration</p>
        </div>

        <StudentLoginForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Main Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
