'use client';

import { useEffect, useState } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  specialization: string[];
}

interface TeachersListProps {
  refreshTrigger?: number;
}

export default function TeachersList({ refreshTrigger }: TeachersListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, [refreshTrigger]);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teachers');
      const data = await response.json();
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const response = await fetch(`/api/teachers?id=${teacherId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading teachers...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Teachers List</h2>

      {teachers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No teachers added yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Specialization</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{teacher.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{teacher.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{teacher.employeeId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {teacher.specialization.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.specialization.map((spec, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
