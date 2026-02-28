'use client';

import { useEffect, useState } from 'react';

interface Semester {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  year: number;
  semester: number;
}

interface Teacher {
  _id: string;
  name: string;
  employeeId: string;
}

interface TimetableEntry {
  _id: string;
  semesterId: Semester;
  courseId: Course;
  teacherId: Teacher;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  creditHoursPerWeek: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableForm() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchTimetable();
    }
  }, [selectedSemester]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [semRes, courseRes, teacherRes] = await Promise.all([
        fetch('/api/semesters'),
        fetch('/api/courses'),
        fetch('/api/teachers'),
      ]);

      const semData = await semRes.json();
      const courseData = await courseRes.json();
      const teacherData = await teacherRes.json();

      if (semData.success) setSemesters(semData.semesters);
      if (courseData.success) setCourses(courseData.courses);
      if (teacherData.success) setTeachers(teacherData.teachers);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`/api/timetable?semesterId=${selectedSemester}`);
      const data = await response.json();
      if (data.success) {
        setTimetable(data.timetable);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSemester || !selectedCourse || !selectedTeacher || !room) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterId: selectedSemester,
          courseId: selectedCourse,
          teacherId: selectedTeacher,
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime,
          room,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Timetable entry created successfully');
        setSelectedCourse('');
        setSelectedTeacher('');
        setRoom('');
        setStartTime('09:00');
        setEndTime('10:00');
        fetchTimetable();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to create timetable entry');
      }
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      setMessage('Error creating timetable entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;

    try {
      const response = await fetch(`/api/timetable?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Timetable entry deleted successfully');
        fetchTimetable();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete timetable entry');
      }
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      setMessage('Error deleting timetable entry');
    }
  };

  const selectedCourseData = courses.find(c => c._id === selectedCourse);
  const creditHours = selectedCourseData?.credits || 0;

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Timetable</h2>

      {/* Semester Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a semester</option>
          {semesters.map((sem) => (
            <option key={sem._id} value={sem._id}>
              {sem.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSemester && (
        <>
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode} - {course.courseName} ({course.credits} credits)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g., A101, Lab-1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Credit Hours Info */}
            {selectedCourseData && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Course:</strong> {selectedCourseData.courseName}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Credit Hours per Week:</strong> {creditHours} hours
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  This course requires {creditHours} hours of instruction per week. You can distribute these hours across multiple days.
                </p>
              </div>
            )}

            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.includes('success')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Add to Timetable
            </button>
          </form>

          {/* Timetable Display */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timetable Entries</h3>
            {timetable.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No timetable entries for this semester</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Room</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credits/Week</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((entry) => (
                      <tr key={entry._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {typeof entry.courseId === 'object' ? entry.courseId.courseCode : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {typeof entry.teacherId === 'object' ? entry.teacherId.name : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{DAYS[entry.dayOfWeek]}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{entry.room}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{entry.creditHoursPerWeek}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDelete(entry._id)}
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
        </>
      )}
    </div>
  );
}
