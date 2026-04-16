'use client';

import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
}

interface Assignment {
  _id: string;
  year: number;
  semester: number;
}

interface Student {
  _id: string;
  studentName: string;
  rollNumber: string;
  section: 'A' | 'B' | 'C';
  grade?: {
    sessionalMarks: number;
    totalMarks: number;
    comments?: string;
    gradedAt: string;
  };
}

interface VerySimpleGradingProps {
  assignmentId: string;
}

export default function VerySimpleGrading({ assignmentId }: VerySimpleGradingProps) {
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');
  const [students, setStudents] = useState<Student[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [marks, setMarks] = useState<Record<string, { sessionalMarks: string; comments: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [selectedSection]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get teacherId from NextAuth session instead of localStorage
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      
      if (!sessionData?.user?.id) {
        setError('Please log in again.');
        return;
      }

      const teacherId = sessionData.user.id;

      console.log('Fetching students with:', { assignmentId, selectedSection, teacherId });

      const studentsResponse = await fetch(
        `/api/grading/simple?assignmentId=${assignmentId}&section=${selectedSection}&teacherId=${teacherId}`
      );

      console.log('API response status:', studentsResponse.status);

      if (!studentsResponse.ok) {
        const errorData = await studentsResponse.json();
        console.log('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch students');
      }

      const data = await studentsResponse.json();
      console.log('API success response:', data);
      
      setStudents(data.students || []);
      setCourse(data.course);
      setAssignment(data.assignment);

      // Initialize marks state with existing grades
      const initialMarks: Record<string, { sessionalMarks: string; comments: string }> = {};
      
      data.students.forEach((student: Student) => {
        initialMarks[student._id] = {
          sessionalMarks: student.grade?.sessionalMarks?.toString() || '',
          comments: student.grade?.comments || ''
        };
      });
      setMarks(initialMarks);

    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, field: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const validateMark = (mark: string): boolean => {
    const markNum = parseFloat(mark);
    return !isNaN(markNum) && markNum >= 0 && markNum <= 40;
  };

  const handleSubmitMarks = async () => {
    const marksToSubmit = [];
    const errors = [];

    for (const [studentId, studentMarks] of Object.entries(marks)) {
      // Check if marks are entered for this student
      if (studentMarks.sessionalMarks.trim() !== '') {
        // Validate marks
        if (!validateMark(studentMarks.sessionalMarks)) {
          const student = students.find(s => s._id === studentId);
          errors.push(`Invalid marks for ${student?.studentName}: ${studentMarks.sessionalMarks} (must be 0-40)`);
          continue;
        }

        marksToSubmit.push({
          studentId,
          sessionalMarks: parseFloat(studentMarks.sessionalMarks),
          section: selectedSection,
          comments: studentMarks.comments.trim() || undefined
        });
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (marksToSubmit.length === 0) {
      setError('Please enter marks for at least one student');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Get teacherId from NextAuth session
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData?.user?.id) {
        setError('Please log in again.');
        return;
      }

      const teacherId = sessionData.user.id;

      const response = await fetch('/api/grading/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: marksToSubmit,
          teacherId,
          assignmentId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Successfully saved marks for ${data.saved} students`);
        await fetchStudents(); // Refresh to show updated marks
      } else {
        setError(data.error || 'Failed to save marks');
      }
    } catch (err) {
      setError('Failed to save marks. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading students...</span>
      </div>
    );
  }

  if (!course || !assignment) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course Assignment Not Found</h3>
        <p className="text-gray-600 mb-4">
          Unable to load course details for assignment ID: {assignmentId}
        </p>
        <div className="text-sm text-gray-500 mb-4">
          This might happen if:
          <ul className="list-disc list-inside mt-2">
            <li>The assignment doesn't exist</li>
            <li>You don't have access to this assignment</li>
            <li>The course details are missing</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.href = '/teacher/grading'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Grade Students - {course.courseCode}
          </h3>
          <p className="text-sm text-gray-600">
            {course.courseName} • Year {course.year} • Semester {course.semester}
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Enter sessional marks out of 40
          </p>
        </div>
      </div>

      {/* Section Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Select Section</h4>
          <div className="text-sm text-gray-600">
            {students.length} students in Section {selectedSection}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {(['A', 'B', 'C'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSection === section
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Section {section}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Students Marks Table */}
      {students.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            No students found in Section {selectedSection} for this course
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessional Marks (out of 40)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={marks[student._id]?.sessionalMarks || ''}
                        onChange={(e) => handleMarkChange(student._id, 'sessionalMarks', e.target.value)}
                        placeholder="0"
                        className={`w-20 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          marks[student._id]?.sessionalMarks && !validateMark(marks[student._id].sessionalMarks)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                      <span className="ml-2 text-xs text-gray-500">/ 40</span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={marks[student._id]?.comments || ''}
                        onChange={(e) => handleMarkChange(student._id, 'comments', e.target.value)}
                        placeholder="Optional comments..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.grade ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Graded ({student.grade.sessionalMarks}/40)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Graded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Enter sessional marks (0-40) for students and click save
              </div>
              <button
                onClick={handleSubmitMarks}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}