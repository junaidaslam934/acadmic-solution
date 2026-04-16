'use client';

import { useEffect, useState } from 'react';

interface Student {
  studentId: string;
  studentName: string;
  rollNumber: string;
  isAbsent: boolean;
}

interface Week {
  _id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  isHoliday: boolean;
}

interface AttendanceSession {
  sessionNumber: number;
  isCompleted: boolean;
  completedAt?: string;
}

interface AttendanceTrackerProps {
  teacherId: string;
}

export default function AttendanceTracker({ teacherId }: AttendanceTrackerProps) {
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<number>(1);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [completedSessions, setCompletedSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesterId, setSemesterId] = useState<string>('');
  const [currentWeekInfo, setCurrentWeekInfo] = useState<string>('');

  useEffect(() => {
    fetchAssignedCourses();
  }, [teacherId]);

  useEffect(() => {
    if (selectedCourse && selectedWeek) {
      fetchStudents();
      fetchCompletedSessions();
    }
  }, [selectedCourse, selectedSection, selectedWeek]);

  useEffect(() => {
    if (selectedCourse) {
      fetchWeeks();
    }
  }, [selectedCourse]);

  const fetchAssignedCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/course-assignments-fixed?teacherId=${teacherId}`);
      const data = await response.json();

      console.log('Assigned courses data:', data);

      if (data.success && data.assignments.length > 0) {
        const courses = data.assignments.map((a: any) => {
          const courseId = a.courseId;
          
          return {
            _id: courseId._id || courseId,
            courseCode: courseId.courseCode || 'N/A',
            courseName: courseId.courseName || 'N/A',
            year: a.year,
            credits: courseId.credits || 1,
          };
        });
        
        console.log('Processed courses:', courses);
        setAssignedCourses(courses);
        if (courses.length > 0) {
          setSelectedCourse(courses[0]._id);
        }
      } else {
        setMessage('No courses assigned');
        setAssignedCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentWeek = (weeks: Week[]) => {
    const today = new Date();
    const currentWeek = weeks.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      return today >= startDate && today <= endDate;
    });
    
    if (currentWeek) {
      setCurrentWeekInfo(`Current Week ${currentWeek.weekNumber} (${new Date(currentWeek.startDate).toLocaleDateString()} - ${new Date(currentWeek.endDate).toLocaleDateString()})`);
      return currentWeek;
    }
    
    // If no current week found, find the closest upcoming week
    const upcomingWeek = weeks.find(week => {
      const startDate = new Date(week.startDate);
      return today < startDate;
    });
    
    if (upcomingWeek) {
      setCurrentWeekInfo(`Upcoming Week ${upcomingWeek.weekNumber} (${new Date(upcomingWeek.startDate).toLocaleDateString()} - ${new Date(upcomingWeek.endDate).toLocaleDateString()})`);
      return upcomingWeek;
    }
    
    // If no upcoming week, return the last week
    if (weeks.length > 0) {
      const lastWeek = weeks[weeks.length - 1];
      setCurrentWeekInfo(`Week ${lastWeek.weekNumber} (${new Date(lastWeek.startDate).toLocaleDateString()} - ${new Date(lastWeek.endDate).toLocaleDateString()})`);
      return lastWeek;
    }
    
    return null;
  };

  const fetchCompletedSessions = async () => {
    if (!selectedCourse || !selectedWeek) return;
    
    try {
      const course = assignedCourses.find(c => c._id === selectedCourse);
      if (!course) return;

      const response = await fetch(
        `/api/attendance-sessions?teacherId=${teacherId}&courseId=${selectedCourse}&weekId=${selectedWeek}&section=${selectedSection}`
      );
      const data = await response.json();

      if (data.success) {
        const sessions: AttendanceSession[] = [];
        const maxSessions = course.credits || 1;
        
        for (let i = 1; i <= maxSessions; i++) {
          const completedSession = data.sessions.find((s: any) => s.sessionNumber === i);
          sessions.push({
            sessionNumber: i,
            isCompleted: !!completedSession,
            completedAt: completedSession?.completedAt
          });
        }
        
        setCompletedSessions(sessions);
        
        // Auto-select next available session
        const nextSession = sessions.find(s => !s.isCompleted);
        if (nextSession) {
          setSelectedSession(nextSession.sessionNumber);
        }
      }
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
    }
  };

  const fetchWeeks = async () => {
    try {
      // First, try to get current semester
      const response = await fetch('/api/semesters');
      const data = await response.json();
      
      if (data.success && data.semesters.length > 0) {
        const currentSemester = data.semesters[0]; // Get first semester
        setSemesterId(currentSemester._id);
        
        const weeksResponse = await fetch(
          `/api/generate-weeks?semesterId=${currentSemester._id}`
        );
        const weeksData = await weeksResponse.json();
        
        if (weeksData.success && weeksData.weeks.length > 0) {
          setWeeks(weeksData.weeks);
          
          // Auto-select current week
          const currentWeek = getCurrentWeek(weeksData.weeks);
          if (currentWeek) {
            setSelectedWeek(currentWeek._id);
          }
          
          return currentSemester._id;
        }
      }
      
      // If no semesters found or no weeks, try to get weeks directly from semesterweeks collection
      console.log('No semesters found, trying to get weeks directly...');
      const directWeeksResponse = await fetch('/api/semester-weeks-direct');
      const directWeeksData = await directWeeksResponse.json();
      
      if (directWeeksData.success && directWeeksData.weeks.length > 0) {
        setWeeks(directWeeksData.weeks);
        
        // Auto-select current week
        const currentWeek = getCurrentWeek(directWeeksData.weeks);
        if (currentWeek) {
          setSelectedWeek(currentWeek._id);
          setSemesterId(directWeeksData.weeks[0].semesterId);
        }
        
        return directWeeksData.weeks[0].semesterId;
      }
      
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
    return null;
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const course = assignedCourses.find(c => c._id === selectedCourse);
      if (!course) return;

      const response = await fetch(
        `/api/students-by-class?year=${course.year}&section=${selectedSection}`
      );
      const data = await response.json();

      if (data.success) {
        setStudents(
          data.students.map((s: any) => ({
            studentId: s._id,
            studentName: s.studentName,
            rollNumber: s.rollNumber,
            isAbsent: false,
          }))
        );
      } else {
        setMessage('No students found');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage('Error loading students');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAbsent = (index: number) => {
    const updated = [...students];
    updated[index].isAbsent = !updated[index].isAbsent;
    setStudents(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) {
      setMessage('Please select a course');
      return;
    }

    if (!selectedWeek) {
      setMessage('Please select a week');
      return;
    }

    if (students.length === 0) {
      setMessage('No students to mark attendance');
      return;
    }

    try {
      setIsSubmitting(true);
      const course = assignedCourses.find(c => c._id === selectedCourse);
      const week = weeks.find(w => w._id === selectedWeek);
      
      // If semesterId is not set, fetch it now
      let currentSemesterId = semesterId;
      if (!currentSemesterId) {
        const semResponse = await fetch('/api/semesters');
        const semData = await semResponse.json();
        if (semData.success && semData.semesters.length > 0) {
          currentSemesterId = semData.semesters[0]._id;
          setSemesterId(currentSemesterId);
        }
      }

      if (!currentSemesterId) {
        setMessage('Semester not found');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          courseId: selectedCourse,
          courseName: course.courseName,
          year: course.year,
          section: selectedSection,
          semesterId: currentSemesterId,
          weekId: selectedWeek,
          weekNumber: week?.weekNumber,
          startDate: week?.startDate,
          endDate: week?.endDate,
          sessionNumber: selectedSession,
          attendanceRecords: students,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Attendance marked successfully');
        setStudents(students.map(s => ({ ...s, isAbsent: false })));
        
        // Refresh completed sessions to update the UI
        await fetchCompletedSessions();
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setMessage('Error marking attendance'); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourseData = assignedCourses.find(c => c._id === selectedCourse);
  const absentCount = students.filter(s => s.isAbsent).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mark Attendance</h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {isLoading && <div className="text-center py-8">Loading...</div>}

      {!isLoading && (
        <>
          {/* Course Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course ({assignedCourses.length} available)</option>
                {assignedCourses.length > 0 ? (
                  assignedCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseCode || 'N/A'} - {course.courseName || 'N/A'} (Year {course.year})
                    </option>
                  ))
                ) : (
                  <option disabled>No courses assigned</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as 'A' | 'B' | 'C')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a week ({weeks.length} available)</option>
                {weeks.map((week) => (
                  <option key={week._id} value={week._id}>
                    Week {week.weekNumber} ({new Date(week.startDate).toLocaleDateString()} -{' '}
                    {new Date(week.endDate).toLocaleDateString()})
                    {week.isHoliday ? ' [Holiday]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedCourseData && 
                  Array.from({ length: selectedCourseData.credits || 1 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Session {i + 1}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p>Total: {students.length}</p>
                <p className="text-red-600 font-medium">Absent: {absentCount}</p>
                {selectedCourseData && (
                  <p className="text-blue-600 font-medium">
                    Max per week: {selectedCourseData.credits || 1}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Current Week and Session Status */}
          {currentWeekInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">📅 {currentWeekInfo}</h3>
                  {selectedCourseData && completedSessions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {completedSessions.map((session) => (
                        <span
                          key={session.sessionNumber}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.isCompleted
                              ? 'bg-green-100 text-green-800'
                              : session.sessionNumber === selectedSession
                              ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          Session {session.sessionNumber}
                          {session.isCompleted && ' ✓'}
                          {session.sessionNumber === selectedSession && !session.isCompleted && ' (Current)'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCourseData && (
                  <div className="text-right text-sm text-blue-700">
                    <p>Sessions: {completedSessions.filter(s => s.isCompleted).length} / {selectedCourseData.credits || 1}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Students List */}
          {students.length > 0 ? (
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Mark Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className={`border-b ${student.isAbsent ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.rollNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{student.studentName}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={student.isAbsent}
                            onChange={() => toggleAbsent(index)}
                            className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedCourseData ? 'No students in this section' : 'Select a course to view students'}
            </div>
          )}

          {/* Submit Button */}
          {students.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
