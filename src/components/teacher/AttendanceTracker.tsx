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
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semesterId, setSemesterId] = useState<string>('');

  useEffect(() => {
    fetchAssignedCourses();
  }, [teacherId]);

  useEffect(() => {
    if (selectedCourse) {
      fetchWeeks();
      fetchStudents();
    }
  }, [selectedCourse, selectedSection]);

  const fetchAssignedCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/course-assignments?teacherId=${teacherId}`);
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

  const fetchWeeks = async () => {
    try {
      // Get current semester
      const response = await fetch('/api/semesters');
      const data = await response.json();
      
      if (data.success && data.semesters.length > 0) {
        const currentSemester = data.semesters[0]; // Get first semester
        setSemesterId(currentSemester._id);
        
        const weeksResponse = await fetch(
          `/api/generate-weeks?semesterId=${currentSemester._id}`
        );
        const weeksData = await weeksResponse.json();
        
        if (weeksData.success) {
          setWeeks(weeksData.weeks);
          if (weeksData.weeks.length > 0) {
            setSelectedWeek(weeksData.weeks[0]._id);
          }
        }
        
        return currentSemester._id;
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
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Mark Attendance</h2>

        {message && (
          <div className={`mb-4 px-3 py-2 rounded-md text-xs font-medium ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        {isLoading && <div className="text-center py-8 text-sm text-slate-400">Loading...</div>}

        {!isLoading && (
          <>
            {/* Course Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value as 'A' | 'B' | 'C')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Week</label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>Total: <span className="font-medium text-slate-700">{students.length}</span></p>
                  <p>Absent: <span className="font-medium text-red-600">{absentCount}</span></p>
                  {selectedCourseData && (
                    <p>Max/week: <span className="font-medium text-emerald-600">{selectedCourseData.credits || 1}</span></p>
                  )}
                </div>
              </div>
            </div>

            {/* Students List */}
            {students.length > 0 ? (
              <div className="mb-4 overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Roll Number</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Mark Absent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student, index) => (
                      <tr key={index} className={student.isAbsent ? 'bg-red-50/50' : 'hover:bg-slate-50/50'}>
                        <td className="px-3 py-2.5 text-sm text-slate-900">{student.rollNumber}</td>
                        <td className="px-3 py-2.5 text-sm text-slate-700">{student.studentName}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={student.isAbsent}
                            onChange={() => toggleAbsent(index)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-2 focus:ring-red-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-slate-400">
                {selectedCourseData ? 'No students in this section' : 'Select a course to view students'}
              </div>
            )}

            {/* Submit Button */}
            {students.length > 0 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
