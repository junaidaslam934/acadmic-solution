'use client';

import { useEffect, useState } from 'react';

interface Student {
  _id: string;
  studentName: string;
  rollNumber: string;
  year: number;
  section: string;
  coursesEnrolled: string[];
}

interface StudentsListProps {
  refreshTrigger?: number;
}

export default function StudentsList({ refreshTrigger }: StudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students?id=${studentId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Students List</h2>

      {students.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No students added yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll Number</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Courses</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{student.studentName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{student.rollNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Year {student.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                      Section {student.section}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {student.coursesEnrolled.length > 0 ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {student.coursesEnrolled.length} courses
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDelete(student._id)}
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
