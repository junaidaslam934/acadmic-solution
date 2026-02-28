'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
  credits: number;
}

interface Assignment {
  courseId: string;
  teacherId: string;
  isPreferred: boolean;
}

export default function AssignCoursesPage() {
  const router = useRouter();
  const [advisorYear, setAdvisorYear] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { teacherId: string; isPreferred: boolean }>>({});
  const [existingAssignments, setExistingAssignments] = useState<any[]>([]);
  const [isViewMode, setIsViewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get advisor year from localStorage (set during login)
    const storedYear = localStorage.getItem('advisorYear');
    if (storedYear) {
      const year = parseInt(storedYear);
      setAdvisorYear(year);
    } else {
      // If no year found, redirect to login
      router.push('/class-advisor/login');
    }
  }, [router]);

  useEffect(() => {
    if (advisorYear) {
      fetchTeachers();
      fetchCourses();
      checkExistingAssignments();
    }
  }, [advisorYear]);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) setTeachers(data.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourses = async () => {
    if (!advisorYear) return;
    try {
      const res = await fetch(`/api/courses?year=${advisorYear}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
        // Reset assignments when year changes
        setAssignments({});
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const checkExistingAssignments = async () => {
    if (!advisorYear) return;
    try {
      const res = await fetch(`/api/course-assignments?year=${advisorYear}`);
      const data = await res.json();
      if (data.success && data.assignments && data.assignments.length > 0) {
        setExistingAssignments(data.assignments);
        setIsViewMode(true);
      } else {
        setExistingAssignments([]);
        setIsViewMode(false);
      }
    } catch (error) {
      console.error('Error checking existing assignments:', error);
      setIsViewMode(false);
    }
  };

  const handleTeacherSelect = (courseId: string, teacherId: string) => {
    setAssignments(prev => ({
      ...prev,
      [courseId]: {
        teacherId,
        isPreferred: prev[courseId]?.isPreferred || false
      }
    }));
  };

  const handlePreferenceToggle = (courseId: string) => {
    setAssignments(prev => ({
      ...prev,
      [courseId]: {
        teacherId: prev[courseId]?.teacherId || '',
        isPreferred: !prev[courseId]?.isPreferred
      }
    }));
  };

  const getSelectedTeacher = (courseId: string) => {
    return assignments[courseId]?.teacherId || '';
  };

  const getPreference = (courseId: string) => {
    return assignments[courseId]?.isPreferred || false;
  };

  const allCoursesAssigned = () => {
    return courses.length > 0 && courses.every(course => assignments[course._id]?.teacherId);
  };

  const handleSaveAll = async () => {
    if (!allCoursesAssigned()) {
      setMessage('❌ Please assign teachers to all courses before saving');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Prepare all assignments
      const assignmentPromises = courses.map(async (course) => {
        const assignment = assignments[course._id];
        try {
          const response = await fetch('/api/course-assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teacherId: assignment.teacherId,
              courseId: course._id,
              year: advisorYear,
              semester: course.semester,
              isPreferred: assignment.isPreferred || false,
              // assignedBy will be added later when we have real authentication
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error(`Failed to assign ${course.courseCode}:`, data.error);
            return { success: false, course: course.courseCode, error: data.error };
          }
          
          return { success: true, course: course.courseCode };
        } catch (err) {
          console.error(`Error assigning ${course.courseCode}:`, err);
          return { success: false, course: course.courseCode, error: String(err) };
        }
      });

      // Execute all assignments
      const results = await Promise.all(assignmentPromises);
      const successCount = results.filter(r => r.success).length;
      const failedCourses = results.filter(r => !r.success);

      if (failedCourses.length === 0) {
        setMessage(`✅ All ${successCount} courses assigned successfully!`);
        // Clear assignments and switch to view mode
        setAssignments({});
        // Refresh to show view mode
        checkExistingAssignments();
      } else {
        const failedList = failedCourses.map(f => f.course).join(', ');
        setMessage(`❌ Failed to assign: ${failedList}. Check console for details.`);
        console.error('Failed assignments:', failedCourses);
      }
    } catch (error) {
      setMessage('❌ Failed to save assignments');
      console.error('Error saving assignments:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 8000);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? `${teacher.name} - ${teacher.department}` : '';
  };

  const assignedCount = Object.keys(assignments).length;

  const handleReassign = () => {
    setIsViewMode(false);
    setExistingAssignments([]);
    setAssignments({});
  };

  const getExistingAssignment = (courseId: string) => {
    return existingAssignments.find(a => a.courseId._id === courseId);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Year ${advisorYear} Course Assignments`, 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Courses: ${courses.length}`, 14, 34);
    doc.text(`Total Assignments: ${existingAssignments.length}`, 14, 40);
    
    // Prepare table data
    const tableData = courses.map(course => {
      const assignment = getExistingAssignment(course._id);
      return [
        course.courseCode,
        course.courseName,
        course.credits.toString(),
        `Semester ${course.semester}`,
        assignment ? assignment.teacherId.name : 'Not Assigned',
        assignment ? assignment.teacherId.department : '-',
        assignment?.isPreferred ? 'Yes' : 'No'
      ];
    });
    
    // Add table
    autoTable(doc, {
      startY: 48,
      head: [['Code', 'Course Name', 'Credits', 'Semester', 'Teacher', 'Department', 'Preferred']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234], // Purple color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 18 },
        3: { cellWidth: 22 },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
        6: { cellWidth: 20 }
      },
      didDrawCell: (data) => {
        // Highlight preferred assignments
        if (data.column.index === 6 && data.cell.text[0] === 'Yes') {
          doc.setFillColor(220, 252, 231); // Light green
        }
      }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`Year-${advisorYear}-Course-Assignments-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!advisorYear) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Year Display (Not Selector) */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Year {advisorYear} Class Advisor</h3>
            <p className="text-purple-100">You are managing course assignments for Year {advisorYear} students</p>
          </div>
          <div className="text-6xl opacity-20">
            {advisorYear}
          </div>
        </div>
      </div>

      {/* View Mode Alert */}
      {isViewMode && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📋 Assignments Already Exist for Year {advisorYear}
              </h3>
              <p className="text-blue-800">
                Teachers have already been assigned to all courses for this year. 
                You can view the assignments below or reassign them.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
              >
                📄 Download PDF
              </button>
              <button
                onClick={handleReassign}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium whitespace-nowrap"
              >
                🔄 Reassign Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Progress Indicator - Only show in assign mode */}
      {!isViewMode && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Assignment Progress: {assignedCount} / {courses.length} courses
            </span>
            <span className="text-sm text-blue-700">
              {courses.length > 0 ? Math.round((assignedCount / courses.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${courses.length > 0 ? (assignedCount / courses.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Course Assignment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Year {advisorYear} Courses - {isViewMode ? 'View Assignments' : 'Assign Teachers'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isViewMode 
              ? 'Current teacher assignments for this year' 
              : 'Select a teacher for each course, then click Save All'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign Teacher</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Preferred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No courses found for Year {advisorYear}
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const existingAssignment = getExistingAssignment(course._id);
                  
                  return (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.courseCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{course.courseName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.credits}</td>
                      <td className="px-6 py-4 text-sm">
                        {isViewMode && existingAssignment ? (
                          <div>
                            <div className="font-medium text-gray-900">{existingAssignment.teacherId.name}</div>
                            <div className="text-gray-500 text-xs">{existingAssignment.teacherId.department}</div>
                          </div>
                        ) : (
                          <select
                            value={getSelectedTeacher(course._id)}
                            onChange={(e) => handleTeacherSelect(course._id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">-- Select Teacher --</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.name} - {teacher.department}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {isViewMode && existingAssignment ? (
                          existingAssignment.isPreferred ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ⭐ Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )
                        ) : (
                          <input
                            type="checkbox"
                            checked={getPreference(course._id)}
                            onChange={() => handlePreferenceToggle(course._id)}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Assignments Summary */}
      {assignedCount > 0 && (
        <div className="bg-purple-50 rounded-lg p-6">
          <h4 className="font-semibold text-purple-900 mb-3">Selected Assignments</h4>
          <div className="space-y-2">
            {courses.map((course) => {
              const assignment = assignments[course._id];
              if (!assignment?.teacherId) return null;
              return (
                <div key={course._id} className="flex items-center justify-between text-sm">
                  <span className="text-purple-800 font-medium">{course.courseCode}</span>
                  <span className="text-purple-600">→</span>
                  <span className="text-purple-800">{getTeacherName(assignment.teacherId)}</span>
                  {assignment.isPreferred && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      ⭐ Preferred
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button - Only show in assign mode */}
      {courses.length > 0 && !isViewMode && (
        <div className="flex justify-center">
          <button
            onClick={handleSaveAll}
            disabled={!allCoursesAssigned() || loading}
            className={`px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all ${
              allCoursesAssigned() && !loading
                ? 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Saving Assignments...
              </div>
            ) : allCoursesAssigned() ? (
              `💾 Save All Assignments (${courses.length} courses)`
            ) : (
              `Assign All Courses (${assignedCount}/${courses.length})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
