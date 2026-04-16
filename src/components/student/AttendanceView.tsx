'use client';

import { useEffect, useState } from 'react';

interface WeeklyDetail {
  weekNumber: number;
  date: string;
  isAbsent: boolean;
  status: string;
}

interface SubjectAttendance {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
  weeklyDetails: WeeklyDetail[];
}

interface AttendanceViewProps {
  studentId: string;
  semesterId?: string;
}

export default function AttendanceView({ studentId, semesterId }: AttendanceViewProps) {
  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, [studentId, semesterId]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/student-attendance', window.location.origin);
      url.searchParams.append('studentId', studentId);
      if (semesterId) {
        url.searchParams.append('semesterId', semesterId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setAttendance(data.attendance);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading attendance...</div>;
  }

  if (attendance.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      {summary && (
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Attendance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subjects: {summary.totalSubjects}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {summary.overallAttendancePercentage}%
              </p>
              <p className="text-sm text-gray-600">Average Attendance</p>
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Attendance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h3>

        {attendance.map((subject) => (
          <div key={subject.courseId} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Subject Header */}
            <button
              onClick={() =>
                setExpandedCourse(expandedCourse === subject.courseId ? null : subject.courseId)
              }
              className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">{subject.courseName}</h4>
                <p className="text-sm text-gray-600">{subject.courseCode}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {subject.presentClasses}/{subject.totalClasses} Classes
                  </p>
                  <p className={`text-lg font-bold ${getAttendanceColor(subject.attendancePercentage)}`}>
                    {subject.attendancePercentage}%
                  </p>
                </div>

                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedCourse === subject.courseId ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedCourse === subject.courseId && (
              <div className="border-t bg-gray-50 px-6 py-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{subject.presentClasses}</p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{subject.absentClasses}</p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{subject.totalClasses}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>

                {/* Weekly Details */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Weekly Details</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {subject.weeklyDetails.map((week, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded ${
                          week.isAbsent ? 'bg-red-100' : 'bg-green-100'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900">Week {week.weekNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(week.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            week.isAbsent
                              ? 'bg-red-200 text-red-800'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {week.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
