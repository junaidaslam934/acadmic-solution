'use client';

import { useState, useEffect } from 'react';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
}

interface Assessment {
  _id: string;
  name: string;
  type: 'practical' | 'quiz' | 'midterm' | 'final';
  totalMarks: number;
  description?: string;
}

interface Student {
  _id: string;
  studentName: string;
  rollNumber: string;
  section: 'A' | 'B' | 'C';
  grade?: {
    _id: string;
    marksObtained: number;
    percentage: number;
    comments?: string;
    gradedAt: string;
  };
}

interface GradingInterfaceProps {
  courseId: string;
  course: Course;
  assessment: Assessment;
  onBack: () => void;
}

export default function GradingInterface({ courseId, course, assessment, onBack }: GradingInterfaceProps) {
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, { marksObtained: string; comments: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [selectedSection, assessment._id]);

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
        `/api/teacher/courses/${courseId}/students?section=${selectedSection}&assessmentId=${assessment._id}&teacherId=${teacherId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || []);

      // Initialize grades state with existing grades
      const initialGrades: Record<string, { marksObtained: string; comments: string }> = {};
      data.students.forEach((student: Student) => {
        initialGrades[student._id] = {
          marksObtained: student.grade?.marksObtained?.toString() || '',
          comments: student.grade?.comments || ''
        };
      });
      setGrades(initialGrades);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId: string, field: 'marksObtained' | 'comments', value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const validateGrade = (marksObtained: string): boolean => {
    const marks = parseFloat(marksObtained);
    return !isNaN(marks) && marks >= 0 && marks <= assessment.totalMarks;
  };

  const handleSubmitGrades = async () => {
    // Validate all grades
    const gradesToSubmit = [];
    const errors = [];

    for (const [studentId, gradeData] of Object.entries(grades)) {
      if (gradeData.marksObtained.trim() !== '') {
        if (!validateGrade(gradeData.marksObtained)) {
          const student = students.find(s => s._id === studentId);
          errors.push(`Invalid marks for ${student?.studentName}: ${gradeData.marksObtained}`);
          continue;
        }

        gradesToSubmit.push({
          assessmentId: assessment._id,
          studentId,
          marksObtained: parseFloat(gradeData.marksObtained),
          comments: gradeData.comments.trim() || undefined
        });
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (gradesToSubmit.length === 0) {
      setError('Please enter at least one grade');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/grading/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grades: gradesToSubmit
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Successfully saved ${data.results.length} grades`);
        // Refresh students to show updated grades
        await fetchStudents();
      } else {
        setError(data.message || 'Failed to save grades');
      }
    } catch (err) {
      setError('Failed to save grades. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getGradedCount = () => {
    return students.filter(student => student.grade).length;
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
            {assessment.name} - Grade Students
          </h3>
          <p className="text-sm text-gray-600">
            {course.courseCode} • Total Marks: {assessment.totalMarks}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Assessments
        </button>
      </div>

      {/* Section Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Select Section</h4>
          <div className="text-sm text-gray-600">
            Year {course.year} • {getGradedCount()}/{students.length} graded
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

      {/* Students Grading Table */}
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
                    Marks (out of {assessment.totalMarks})
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
                        max={assessment.totalMarks}
                        step="0.5"
                        value={grades[student._id]?.marksObtained || ''}
                        onChange={(e) => handleGradeChange(student._id, 'marksObtained', e.target.value)}
                        placeholder="0"
                        className={`w-20 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          grades[student._id]?.marksObtained && !validateGrade(grades[student._id].marksObtained)
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={grades[student._id]?.comments || ''}
                        onChange={(e) => handleGradeChange(student._id, 'comments', e.target.value)}
                        placeholder="Optional comments..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.grade ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Graded
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
                Enter marks for students and click save to submit grades
              </div>
              <button
                onClick={handleSubmitGrades}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Grades'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}