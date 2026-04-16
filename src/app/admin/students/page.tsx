'use client';

import { useState } from 'react';
import AddStudentForm from '@/components/admin/AddStudentForm';
import StudentsList from '@/components/admin/StudentsList';

export default function AdminStudentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStudentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Student Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Student Form */}
          <div className="lg:col-span-1">
            <AddStudentForm onStudentAdded={handleStudentAdded} />
          </div>

          {/* Students List */}
          <div className="lg:col-span-2">
            <StudentsList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
