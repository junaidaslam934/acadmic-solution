'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DashboardShell from '@/components/layout/DashboardShell';
import { NavItem } from '@/components/layout/Sidebar';
import Skeleton from '@/components/ui/Skeleton';

interface Assignment {
  _id: string;
  courseId: {
    _id: string;
    courseCode: string;
    courseName: string;
    year: number;
    semester: number;
    credits: number;
  };
  year: number;
  semester: number;
  isPreferred: boolean;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherId = localStorage.getItem('teacherId');
    const name = localStorage.getItem('teacherName');
    
    if (!teacherId) {
      router.push('/login');
      return;
    }
    
    setTeacherName(name || 'Teacher');
    fetchAssignments(teacherId);
  }, [router]);

  const fetchAssignments = async (teacherId: string) => {
    try {
      const res = await fetch(`/api/course-assignments?teacherId=${teacherId}`);
      const data = await res.json();
      
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherId');
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherEmail');
    router.push('/login');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text('My Course Assignments', 14, 20);
    
    // Teacher info
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Teacher: ${teacherName}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Total Courses: ${assignments.length}`, 14, 42);
    doc.text(`Total Credits: ${assignments.reduce((sum, a) => sum + a.courseId.credits, 0)}`, 14, 48);
    
    // Prepare table data
    const tableData = assignments.map(assignment => [
      assignment.courseId.courseCode,
      assignment.courseId.courseName,
      `Year ${assignment.year}`,
      `Semester ${assignment.semester}`,
      assignment.courseId.credits.toString(),
      assignment.isPreferred ? 'Yes' : 'No'
    ]);
    
    // Generate table
    autoTable(doc, {
      startY: 55,
      head: [['Course Code', 'Course Name', 'Year', 'Semester', 'Credits', 'Preferred']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        1: { halign: 'left', cellWidth: 60 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', cellWidth: 25 }
      },
      didParseCell: (data) => {
        // Highlight preferred courses
        if (data.section === 'body' && data.column.index === 5) {
          const rowIndex = data.row.index;
          if (assignments[rowIndex]?.isPreferred) {
            data.cell.styles.fillColor = [220, 252, 231]; // Light green
            data.cell.styles.textColor = [22, 163, 74]; // Green text
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `${teacherName.replace(/\s+/g, '-')}-Course-Assignments-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    );
  }

  const NAV_ITEMS: NavItem[] = [
    { id: 'courses', label: 'My Courses', icon: '📋' },
    { id: 'attendance', label: 'Mark Attendance', icon: '✅' },
  ];

  const handleNavSelect = (id: string) => {
    if (id === 'attendance') {
      router.push('/teacher/attendance');
    }
  };

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      activeItem="courses"
      onNavSelect={handleNavSelect}
      userName={teacherName}
      userRole="Teacher"
      onLogout={handleLogout}
      pageTitle="My Course Assignments"
      pageSubtitle="CIS Academic Portal — Teacher"
    >
      <div className="max-w-5xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-700 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{assignments.length}</p>
              </div>
              <div className="text-4xl">
                <svg className="w-10 h-10 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preferred Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {assignments.filter(a => a.isPreferred).length}
                </p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {assignments.reduce((sum, a) => sum + (a.courseId?.credits || 0), 0)}
                </p>
              </div>
              <div className="text-4xl">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">My Assigned Courses</h2>
              <p className="text-sm text-gray-600 mt-1">Courses you are teaching this academic year</p>
            </div>
            {assignments.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors flex items-center space-x-2"
              >
                <span>📄</span>
                <span>Download PDF</span>
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-medium">No courses assigned yet</p>
              <p className="text-sm mt-2">Please contact your class advisor for course assignments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {assignment.courseId.courseCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {assignment.courseId.courseName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Year {assignment.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Semester {assignment.semester}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {assignment.courseId.credits}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {assignment.isPreferred ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ⭐ Preferred
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Assigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
