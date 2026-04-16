'use client';

import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
}

interface Student {
  _id: string;
  studentName: string;
  rollNumber: string;
  section: 'A' | 'B' | 'C';
  sessionalMarks?: {
    quizMarks: number;
    quizTotal: number;
    assignmentMarks: number;
    assignmentTotal: number;
    midMarks: number;
    midTotal: number;
    totalMarks: number;
    totalPossible: number;
    comments?: string;
  };
}

interface SimpleGradingInterfaceProps {
  courseId: string;
  course: Course;
}

export default function SimpleGradingInterface({ courseId, course }: SimpleGradingInterfaceProps) {
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, {
    quizMarks: string;
    assignmentMarks: string;
    midMarks: string;
    comments: string;
  }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Default totals
  const QUIZ_TOTAL = 10;
  const ASSIGNMENT_TOTAL = 10;
  const MID_TOTAL = 20;
  const TOTAL_POSSIBLE = 40;

  useEffect(() => {
    fetchStudents();
  }, [selectedSection]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        setError('Teacher ID not found. Please log in again.');
        return;
      }

      const response = await fetch(
        `/api/grading/sessional?courseId=${courseId}&section=${selectedSection}&teacherId=${teacherId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);

      // Initialize marks state with existing marks
      const initialMarks: Record<string, {
        quizMarks: string;
        assignmentMarks: string;
        midMarks: string;
        comments: string;
      }> = {};
      
      data.students.forEach((student: Student) => {
        initialMarks[student._id] = {
          quizMarks: student.sessionalMarks?.quizMarks?.toString() || '',
          assignmentMarks: student.sessionalMarks?.assignmentMarks?.toString() || '',
          midMarks: student.sessionalMarks?.midMarks?.toString() || '',
          comments: student.sessionalMarks?.comments || ''
        };
      });
      setMarks(initialMarks);

    } catch (err) {
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

  const validateMark = (mark: string, total: number): boolean => {
    const markNum = parseFloat(mark);
    return !isNaN(markNum) && markNum >= 0 && markNum <= total;
  };

  const calculateTotal = (studentId: string): number => {
    const studentMarks = marks[studentId];
    if (!studentMarks) return 0;
    
    const quiz = parseFloat(studentMarks.quizMarks) || 0;
    const assignment = parseFloat(studentMarks.assignmentMarks) || 0;
    const mid = parseFloat(studentMarks.midMarks) || 0;
    
    return quiz + assignment + mid;
  };

  const handleSubmitMarks = async () => {
    const marksToSubmit = [];
    const errors = [];

    for (const [studentId, studentMarks] of Object.entries(marks)) {
      // Check if any marks are entered for this student
      const hasMarks = studentMarks.quizMarks || studentMarks.assignmentMarks || studentMarks.midMarks;
      
      if (hasMarks) {
        // Validate marks
        if (studentMarks.quizMarks && !validateMark(studentMarks.quizMarks, QUIZ_TOTAL)) {
          const student = students.find(s => s._id === studentId);
          errors.push(`Invalid quiz marks for ${student?.studentName}: ${studentMarks.quizMarks}`);
          continue;
        }
        
        if (studentMarks.assignmentMarks && !validateMark(studentMarks.assignmentMarks, ASSIGNMENT_TOTAL)) {
          const student = students.find(s => s._id === studentId);
          errors.push(`Invalid assignment marks for ${student?.studentName}: ${studentMarks.assignmentMarks}`);
          continue;
        }
        
        if (studentMarks.midMarks && !validateMark(studentMarks.midMarks, MID_TOTAL)) {
          const student = students.find(s => s._id === studentId);
          errors.push(`Invalid mid marks for ${student?.studentName}: ${studentMarks.midMarks}`);
          continue;
        }

        marksToSubmit.push({
          studentId,
          courseId,
          quizMarks: parseFloat(studentMarks.quizMarks) || 0,
          assignmentMarks: parseFloat(studentMarks.assignmentMarks) || 0,
          midMarks: parseFloat(studentMarks.midMarks) || 0,
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

      const teacherId = localStorage.getItem('teacherId');
      const response = await fetch('/api/grading/sessional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marks: marksToSubmit,
          teacherId,
          year: course.year,
          semester: course.semester,
          section: selectedSection
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Successfully saved marks for ${data.saved} students`);
        await fetchStudents(); // Refresh to show updated marks
      } else {
        setError(data.message || 'Failed to save marks');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sessional Marks - {course.courseCode}
          </h3>
          <p className="text-sm text-gray-600">
            Quiz ({QUIZ_TOTAL}) + Assignment ({ASSIGNMENT_TOTAL}) + Mid ({MID_TOTAL}) = Total ({TOTAL_POSSIBLE})
          </p>
        </div>
      </div>

      {/* Section Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Select Section</h4>
          <div className="text-sm text-gray-600">
            Year {course.year} • {students.length} students
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
            No students found in Section {selectedSection} for Year {course.year}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz /{QUIZ_TOTAL}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment /{ASSIGNMENT_TOTAL}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mid /{MID_TOTAL}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total /{TOTAL_POSSIBLE}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
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
                        max={QUIZ_TOTAL}
                        step="0.5"
                        value={marks[student._id]?.quizMarks || ''}
                        onChange={(e) => handleMarkChange(student._id, 'quizMarks', e.target.value)}
                        placeholder="0"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max={ASSIGNMENT_TOTAL}
                        step="0.5"
                        value={marks[student._id]?.assignmentMarks || ''}
                        onChange={(e) => handleMarkChange(student._id, 'assignmentMarks', e.target.value)}
                        placeholder="0"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max={MID_TOTAL}
                        step="0.5"
                        value={marks[student._id]?.midMarks || ''}
                        onChange={(e) => handleMarkChange(student._id, 'midMarks', e.target.value)}
                        placeholder="0"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {calculateTotal(student._id)} / {TOTAL_POSSIBLE}
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Enter marks for students and click save to submit sessional marks
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