'use client';

import { useState } from 'react';
import CourseAssignmentForm from '@/components/admin/CourseAssignmentForm';

export default function AdminCoursesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAssignmentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Course Management</h1>

        <div>
          <CourseAssignmentForm refreshTrigger={refreshTrigger} onAssignmentAdded={handleAssignmentAdded} />
        </div>
      </div>
    </div>
  );
}
