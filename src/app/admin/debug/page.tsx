'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teachersRes, coursesRes] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/courses'),
        ]);

        const teachersData = await teachersRes.json();
        const coursesData = await coursesRes.json();

        console.log('Teachers API Response:', teachersData);
        console.log('Courses API Response:', coursesData);

        if (teachersData.success) {
          setTeachers(teachersData.teachers || []);
        } else {
          setError(`Teachers error: ${teachersData.message}`);
        }

        if (coursesData.success) {
          setCourses(coursesData.courses || []);
        } else {
          setError(`Courses error: ${coursesData.error}`);
        }
      } catch (err) {
        setError(`Fetch error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Debug Page</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teachers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Teachers ({teachers.length})</h2>
              {teachers.length === 0 ? (
                <p className="text-gray-500">No teachers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">{teacher.name}</td>
                          <td className="px-4 py-2 text-xs font-mono">{teacher.employeeId}</td>
                          <td className="px-4 py-2 text-xs">{teacher.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Courses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Courses ({courses.length})</h2>
              {courses.length === 0 ? (
                <p className="text-gray-500">No courses found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Code</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Year</th>
                        <th className="px-4 py-2 text-left">Sem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2">{course.courseCode}</td>
                          <td className="px-4 py-2">{course.courseName}</td>
                          <td className="px-4 py-2">{course.year}</td>
                          <td className="px-4 py-2">{course.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
