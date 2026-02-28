'use client';

import { useState, useEffect } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
  credits: number;
}

interface Assignment {
  _id: string;
  teacherId: { _id: string; name: string; email: string };
  courseId: { _id: string; courseCode: string; courseName: string };
  year: number;
  semester: number;
  isPreferred: boolean;
}

export default function AssignCoursesPage() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchAssignments();
  }, [selectedYear]);

  useEffect(() => {
    fetchCourses();
  }, [selectedYear]);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      
      if (data.success && Array.isArray(data.teachers)) {
        setTeachers(data.teachers);
      } else {
        setTeachers([]);
      }
      if (data.success) setTeachers(data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/courses?year=${selectedYear}`);
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`/api/course-assignments?year=${selectedYear}`);
      const data = await res.json();
      if (data.success) setAssignments(data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssign = async (teacherId: string, courseId: string, semester: number) => {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/course-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          courseId,
          year: selectedYear,
          semester,
          assignedBy: 'temp-advisor-id', // Replace with actual advisor ID from session
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ Course assigned successfully!');
        fetchAssignments();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to assign course');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
      const res = await fetch(`/api/course-assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ Assignment removed successfully!');
        fetchAssignments();
      }
    } catch (error) {
      setMessage('❌ Failed to remove assignment');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getAssignedTeacher = (courseId: string) => {
    return assignments.find(a => a.courseId._id === courseId);
  };

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Select Year</h3>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Year {year}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Course Assignment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Year {selectedYear} Courses</h3>
          <p className="text-sm text-gray-600 mt-1">Assign teachers to courses</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preferred</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => {
                const assignment = getAssignedTeacher(course._id);
                return (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.courseCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Semester {course.semester}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.credits}</td>
                    <td className="px-6 py-4 text-sm">
                      {assignment ? (
                        <div>
                          <div className="font-medium text-gray-900">{assignment.teacherId.name}</div>
                          <div className="text-gray-500 text-xs">{assignment.teacherId.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {assignment?.isPreferred ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ⭐ Preferred
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {assignment ? (
                        <button
                          onClick={() => handleUnassign(assignment._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove
                        </button>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(e.target.value, course._id, course.semester);
                              e.target.value = '';
                            }
                          }}
                          className="border border-gray-300 rounded px-3 py-1 text-sm"
                          disabled={loading}
                        >
                          <option value="">Assign Teacher</option>
                          {teachers && teachers.length > 0 ? teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name} - {teacher.department}
                            </option>
                          )) : (
                            <option disabled>No teachers available</option>
                          )}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Assignment Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-600">Total Courses:</span>
            <span className="ml-2 font-semibold text-blue-900">{courses.length}</span>
          </div>
          <div>
            <span className="text-blue-600">Assigned:</span>
            <span className="ml-2 font-semibold text-blue-900">{assignments.length}</span>
          </div>
          <div>
            <span className="text-blue-600">Unassigned:</span>
            <span className="ml-2 font-semibold text-blue-900">{courses.length - assignments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
