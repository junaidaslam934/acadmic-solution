'use client';

import { useEffect, useState } from 'react';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  credits: number;
}

interface Student {
  _id: string;
  studentName: string;
  rollNumber: string;
  year: 1 | 2 | 3 | 4;
  section: string;
  coursesEnrolled: string[];
}

interface CourseRegistrationProps {
  studentId: string;
}

export default function CourseRegistration({ studentId }: CourseRegistrationProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchStudentCourses();
  }, [studentId, selectedSemester]);

  const fetchStudentCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/student-courses?studentId=${studentId}&semester=${selectedSemester}`);
      const data = await response.json();

      if (data.success) {
        setStudent(data.student);
        setCourses(data.courses);
        setEnrolledCourses(data.student.coursesEnrolled || []);
      } else {
        setMessage(data.error || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch('/api/student-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId }),
      });

      const data = await response.json();
      if (data.success) {
        setEnrolledCourses([...enrolledCourses, courseId]);
        setMessage('Course enrolled successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      setMessage('Error enrolling in course');
    }
  };

  const handleDrop = async (courseId: string) => {
    if (!confirm('Are you sure you want to drop this course?')) return;

    try {
      const response = await fetch(`/api/student-courses?studentId=${studentId}&courseId=${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
        setMessage('Course dropped successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to drop course');
      }
    } catch (error) {
      console.error('Error dropping:', error);
      setMessage('Error dropping course');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (!student) {
    return <div className="text-center py-8 text-red-600">Student not found</div>;
  }

  const availableCourses = courses.filter(c => !enrolledCourses.includes(c._id));
  const enrolledCoursesList = courses.filter(c => enrolledCourses.includes(c._id));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Registration</h2>
        <div className="text-sm text-gray-600">
          <p>Name: {student.studentName}</p>
          <p>Roll Number: {student.rollNumber}</p>
          <p>Year: {student.year} | Section: {student.section}</p>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="mb-6 flex gap-2 border-b pb-4">
        {[1, 2].map((sem) => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem as 1 | 2)}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedSemester === sem
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Courses */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Courses ({availableCourses.length})</h3>
          {availableCourses.length === 0 ? (
            <p className="text-gray-500">No available courses</p>
          ) : (
            <div className="space-y-3">
              {availableCourses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{course.courseCode}</p>
                      <p className="text-sm text-gray-600">{course.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">{course.credits} credits</p>
                    </div>
                    <button
                      onClick={() => handleEnroll(course._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrolled Courses */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses ({enrolledCoursesList.length})</h3>
          {enrolledCoursesList.length === 0 ? (
            <p className="text-gray-500">No enrolled courses</p>
          ) : (
            <div className="space-y-3">
              {enrolledCoursesList.map((course) => (
                <div key={course._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{course.courseCode}</p>
                      <p className="text-sm text-gray-600">{course.courseName}</p>
                      <p className="text-xs text-gray-500 mt-1">{course.credits} credits</p>
                    </div>
                    <button
                      onClick={() => handleDrop(course._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
