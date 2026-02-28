'use client';

import { useEffect, useState } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  specialization: string[];
}

interface Course {
  _id?: string;
  courseCode: string;
  courseName: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  credits: number;
}

interface CourseAssignment {
  _id: string;
  teacherId: string;
  courseId: string | { courseCode: string; courseName: string; credits: number };
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  isPreferred: boolean;
}

interface CourseAssignmentFormProps {
  refreshTrigger?: number;
  onAssignmentAdded?: () => void;
}

export default function CourseAssignmentForm({ refreshTrigger, onAssignmentAdded }: CourseAssignmentFormProps) {
  const [activeYear, setActiveYear] = useState<1 | 2 | 3 | 4>(1);
  const [activeSemester, setActiveSemester] = useState<1 | 2>(1);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isPreferred, setIsPreferred] = useState(false);
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchAssignments();
  }, [activeYear, activeSemester]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Loading teachers and courses...');
      
      const [teachersRes, coursesRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/courses'),
      ]);

      const teachersData = await teachersRes.json();
      const coursesData = await coursesRes.json();

      console.log('Teachers Response:', teachersData);
      console.log('Courses Response:', coursesData);

      if (teachersData.success && teachersData.teachers) {
        setTeachers(teachersData.teachers);
        setDebugInfo(`Loaded ${teachersData.teachers.length} teachers`);
      } else {
        setDebugInfo(`Error loading teachers: ${teachersData.message || 'Unknown error'}`);
      }

      if (coursesData.success && coursesData.courses) {
        setCourses(coursesData.courses);
        setDebugInfo(prev => `${prev} | Loaded ${coursesData.courses.length} courses`);
      } else {
        setDebugInfo(prev => `${prev} | Error loading courses: ${coursesData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setDebugInfo(`Error: ${error}`);
      setMessage('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/course-assignments?year=${activeYear}&semester=${activeSemester}`);
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeacher || !selectedCourse) {
      setMessage('Please select both teacher and course');
      return;
    }

    try {
      const course = courses.find(c => c._id === selectedCourse);
      if (!course) {
        setMessage('Course not found');
        return;
      }

      const response = await fetch('/api/course-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          courseId: selectedCourse,
          year: activeYear,
          semester: course.semester,
          isPreferred,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Course assigned successfully');
        setSelectedTeacher('');
        setSelectedCourse('');
        setIsPreferred(false);
        fetchAssignments();
        onAssignmentAdded?.();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to assign course');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      setMessage('Error assigning course');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      const response = await fetch(`/api/course-assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchAssignments();
        onAssignmentAdded?.();
      } else {
        setMessage('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage('Error deleting assignment');
    }
  };

  const yearCourses = courses.filter(c => c.year === activeYear && c.semester === activeSemester);
  const yearAssignments = assignments.filter(a => a.year === activeYear && a.semester === activeSemester);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Courses to Teachers</h2>

      {/* Year Tabs */}
      <div className="flex gap-2 mb-2 border-b">
        {[1, 2, 3, 4].map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year as 1 | 2 | 3 | 4)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeYear === year
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Year {year}
          </button>
        ))}
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[1, 2].map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSemester(sem as 1 | 2)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSemester === sem
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      {/* Assignment Form */}
      <form onSubmit={handleAssign} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a teacher ({teachers.length} available)</option>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.employeeId})
                  </option>
                ))
              ) : (
                <option disabled>No teachers available</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a course ({yearCourses.length} for Year {activeYear}, Sem {activeSemester})</option>
              {yearCourses.length > 0 ? (
                yearCourses.map((course, idx) => (
                  <option key={course._id || idx} value={course._id || course.courseCode}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))
              ) : (
                <option disabled>No courses available for Year {activeYear}</option>
              )}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPreferred}
                onChange={(e) => setIsPreferred(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Preferred</span>
            </label>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
        >
          Assign Course
        </button>
      </form>

      {/* Assignments List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Year {activeYear}, Semester {activeSemester} Assignments</h3>
        {yearAssignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No assignments for Year {activeYear}, Semester {activeSemester}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Preferred</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {yearAssignments.map((assignment) => {
                  const teacher = teachers.find(t => t._id === assignment.teacherId);
                  
                  // Handle both populated course object and courseId string
                  let courseDisplay = 'Unknown';
                  if (typeof assignment.courseId === 'object' && assignment.courseId) {
                    // Course is populated as an object
                    courseDisplay = `${(assignment.courseId as any).courseCode} - ${(assignment.courseId as any).courseName}`;
                  } else {
                    // Course is just an ID, find it in our courses array
                    const course = courses.find(c => c._id === assignment.courseId);
                    if (course) {
                      courseDisplay = `${course.courseCode} - ${course.courseName}`;
                    }
                  }
                  
                  return (
                    <tr key={assignment._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{teacher?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{courseDisplay}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">Sem {assignment.semester}</td>
                      <td className="px-4 py-3 text-sm">
                        {assignment.isPreferred ? (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDelete(assignment._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-xs text-gray-600 font-mono">{debugInfo}</p>
      </div>
    </div>
  );
}
