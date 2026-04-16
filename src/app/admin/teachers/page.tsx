'use client';

import { useState } from 'react';
import AddTeacherForm from '@/components/admin/AddTeacherForm';
import TeachersList from '@/components/admin/TeachersList';

export default function AdminTeachersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTeacherAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Teacher Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Teacher Form */}
          <div className="lg:col-span-1">
            <AddTeacherForm onTeacherAdded={handleTeacherAdded} />
          </div>

          {/* Teachers List */}
          <div className="lg:col-span-2">
            <TeachersList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
