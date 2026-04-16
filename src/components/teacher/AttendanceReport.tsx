'use client';

import { useEffect, useState } from 'react';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  rollNumber: string;
  presentSessions: number;
  absentSessions: number;
  creditHoursPresent: number;
  creditHoursAbsent: number;
}

interface WeekData {
  weekNumber: number;
  totalCreditHours: number;
  classes: Array<{
    date: string;
    creditHours: number;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
  }>;
  studentAttendance: StudentAttendance[];
}

interface CourseReport {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalCreditHours: number;
  totalStudents: number;
  weeks: WeekData[];
}

interface Props {
  teacherId: string;
  semesterId: string;
}

export default function AttendanceReport({ teacherId, semesterId }: Props) {
  const [report, setReport] = useState<CourseReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    fetchReport();
  }, [teacherId, semesterId]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/teacher-attendance-report?teacherId=${teacherId}&semesterId=${semesterId}`
      );
      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        if (data.report.length > 0) {
          setSelectedCourse(data.report[0].courseId);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCourse = report.find((c) => c.courseId === selectedCourse);

  if (isLoading) {
    return <div className="text-center py-8">Loading attendance report...</div>;
  }

  if (report.length === 0) {
    return <div className="text-center py-8 text-gray-500">No attendance records found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Report</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedWeek(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {report.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseCode} - {course.courseName}
              </option>
            ))}
          </select>
        </div>

        {currentCourse && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Credit Hours</p>
              <p className="text-2xl font-bold text-blue-600">{currentCourse.totalCreditHours}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-green-600">{currentCourse.totalStudents}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Weeks</p>
              <p className="text-2xl font-bold text-purple-600">{currentCourse.weeks.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Week Selection */}
      {currentCourse && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Select Week</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
            {currentCourse.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                  selectedWeek === week.weekNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                W{week.weekNumber}
              </button>
            ))}
          </div>

          {/* Week Details */}
          {selectedWeek !== null && (
            <div className="space-y-6">
              {(() => {
                const week = currentCourse.weeks.find((w) => w.weekNumber === selectedWeek);
                if (!week) return null;

                return (
                  <>
                    {/* Week Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Week {week.weekNumber} Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Credit Hours</p>
                          <p className="text-lg font-bold text-blue-600">{week.totalCreditHours}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Classes Held</p>
                          <p className="text-lg font-bold text-indigo-600">{week.classes.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Attendance</p>
                          <p className="text-lg font-bold text-green-600">
                            {week.classes.length > 0
                              ? (
                                  (week.classes.reduce((sum, c) => sum + c.presentCount, 0) /
                                    week.classes.reduce((sum, c) => sum + c.totalStudents, 0)) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Classes in Week */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Classes Held</h4>
                      <div className="space-y-2">
                        {week.classes.map((cls, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(cls.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                                <p className="text-sm text-gray-600">{cls.creditHours} credit hour(s)</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">
                                  <span className="text-green-600 font-semibold">{cls.presentCount}</span>
                                  <span className="text-gray-600"> / {cls.totalStudents}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  {((cls.presentCount / cls.totalStudents) * 100).toFixed(0)}% present
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Student Attendance */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Student Attendance</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 border-b">
                            <tr>
                              <th className="px-4 py-2 text-left font-semibold text-gray-700">Roll No.</th>
                              <th className="px-4 py-2 text-left font-semibold text-gray-700">Student Name</th>
                              <th className="px-4 py-2 text-center font-semibold text-gray-700">Present</th>
                              <th className="px-4 py-2 text-center font-semibold text-gray-700">Absent</th>
                              <th className="px-4 py-2 text-center font-semibold text-gray-700">Credit Hrs (P)</th>
                              <th className="px-4 py-2 text-center font-semibold text-gray-700">Credit Hrs (A)</th>
                              <th className="px-4 py-2 text-center font-semibold text-gray-700">Attendance %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {week.studentAttendance.map((student) => {
                              const totalSessions = student.presentSessions + student.absentSessions;
                              const attendancePercent =
                                totalSessions > 0
                                  ? ((student.presentSessions / totalSessions) * 100).toFixed(1)
                                  : 0;

                              return (
                                <tr key={student.studentId} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2 text-gray-900 font-medium">{student.rollNumber}</td>
                                  <td className="px-4 py-2 text-gray-900">{student.studentName}</td>
                                  <td className="px-4 py-2 text-center">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                                      {student.presentSessions}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                                      {student.absentSessions}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-center text-gray-900">
                                    {student.creditHoursPresent}
                                  </td>
                                  <td className="px-4 py-2 text-center text-gray-900">
                                    {student.creditHoursAbsent}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <span
                                      className={`font-semibold ${
                                        parseFloat(attendancePercent as string) >= 75
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {attendancePercent}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
