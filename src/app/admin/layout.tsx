import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Academic Solutions Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, Admin</span>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 border-t border-gray-200 pt-2 -mb-px overflow-x-auto">
            <a
              href="/admin/dashboard"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap"
            >
              Dashboard
            </a>
            <a
              href="/admin/teachers"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap"
            >
              Teachers
            </a>
            <a
              href="/admin/students"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap"
            >
              Students
            </a>
            <a
              href="/admin/courses"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap"
            >
              Course Assignments
            </a>
            <a
              href="/admin/class-advisors"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap"
            >
              Class Advisors
            </a>
            <a
              href="/admin/dashboard?tab=pdf"
              className="px-6 py-3 text-sm font-medium rounded-t-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 whitespace-nowrap"
            >
              📄 PDF Upload
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
