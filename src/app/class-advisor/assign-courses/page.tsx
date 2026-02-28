'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  specialization: string[];
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
      if (data.success) setTeachers(data.teachers || []);
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
    return teacher ? `${teacher.name} - ${teacher.specialization?.join(', ') || 'N/A'}` : '';
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
        assignment ? (assignment.teacherId.specialization?.join(', ') || '-') : '-',
        assignment?.isPreferred ? 'Yes' : 'No'
      ];
    });
    
    // Add table
    autoTable(doc, {
      startY: 48,
      head: [['Code', 'Course Name', 'Credits', 'Semester', 'Teacher', 'Specialization', 'Preferred']],
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Year Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Year {advisorYear} Class Advisor</h3>
            <p className="text-purple-200 text-sm mt-0.5">Managing course assignments for Year {advisorYear} students</p>
          </div>
          <span className="text-5xl font-black opacity-20">{advisorYear}</span>
        </div>
      </div>

      {/* View Mode Alert */}
      {isViewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Assignments Already Exist for Year {advisorYear}</h3>
              <p className="text-xs text-blue-700 mt-0.5">Teachers have been assigned to all courses. You can view or reassign them.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleDownloadPDF}
                className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors">
                Download PDF
              </button>
              <button onClick={handleReassign}
                className="px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors">
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Progress */}
      {!isViewMode && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              Progress: {assignedCount} / {courses.length} courses
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {courses.length > 0 ? Math.round((assignedCount / courses.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${courses.length > 0 ? (assignedCount / courses.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Course Assignment Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">
            Year {advisorYear} Courses — {isViewMode ? 'View Assignments' : 'Assign Teachers'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isViewMode ? 'Current teacher assignments' : 'Select a teacher for each course, then save'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Course Name</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Credits</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Assign Teacher</th>
                <th className="px-5 py-3 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Preferred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                    No courses found for Year {advisorYear}
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const existingAssignment = getExistingAssignment(course._id);
                  return (
                    <tr key={course._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-900">{course.courseCode}</td>
                      <td className="px-5 py-3 text-sm text-slate-700">{course.courseName}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{course.credits}</td>
                      <td className="px-5 py-3 text-sm">
                        {isViewMode && existingAssignment ? (
                          <div>
                            <p className="font-medium text-slate-900">{existingAssignment.teacherId.name}</p>
                            <p className="text-xs text-slate-500">{existingAssignment.teacherId.specialization?.join(', ') || ''}</p>
                          </div>
                        ) : (
                          <select value={getSelectedTeacher(course._id)} onChange={(e) => handleTeacherSelect(course._id, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="">-- Select Teacher --</option>
                            {teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.name} - {teacher.specialization?.join(', ') || 'N/A'}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-center">
                        {isViewMode && existingAssignment ? (
                          existingAssignment.isPreferred ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">Yes</span>
                          ) : (
                            <span className="text-slate-400 text-xs">No</span>
                          )
                        ) : (
                          <input type="checkbox" checked={getPreference(course._id)} onChange={() => handlePreferenceToggle(course._id)}
                            className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer" />
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
      {assignedCount > 0 && !isViewMode && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-purple-800 mb-2">Selected Assignments</h4>
          <div className="space-y-1.5">
            {courses.map((course) => {
              const assignment = assignments[course._id];
              if (!assignment?.teacherId) return null;
              return (
                <div key={course._id} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-purple-800">{course.courseCode}</span>
                  <span className="text-purple-400 mx-2">&rarr;</span>
                  <span className="text-purple-700 flex-1">{getTeacherName(assignment.teacherId)}</span>
                  {assignment.isPreferred && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">Preferred</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      {courses.length > 0 && !isViewMode && (
        <div className="flex justify-center">
          <button onClick={handleSaveAll} disabled={!allCoursesAssigned() || loading}
            className={`px-6 py-3 rounded-md text-sm font-semibold text-white transition-all ${
              allCoursesAssigned() && !loading ? 'bg-purple-600 hover:bg-purple-700 shadow-sm' : 'bg-slate-300 cursor-not-allowed'
            }`}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Saving...
              </span>
            ) : allCoursesAssigned() ? (
              `Save All Assignments (${courses.length} courses)`
            ) : (
              `Assign All Courses (${assignedCount}/${courses.length})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
