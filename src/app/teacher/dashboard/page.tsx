'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    if (!teacherId) { router.push('/login'); return; }
    setTeacherName(name || 'Teacher');
    fetchAssignments(teacherId);
  }, [router]);

  const fetchAssignments = async (teacherId: string) => {
    try {
      const res = await fetch(`/api/course-assignments?teacherId=${teacherId}`);
      const data = await res.json();
      if (data.success) setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text('My Course Assignments', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Teacher: ${teacherName}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Total Courses: ${assignments.length}`, 14, 42);
    doc.text(`Total Credits: ${assignments.reduce((sum, a) => sum + a.courseId.credits, 0)}`, 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [['Course Code', 'Course Name', 'Year', 'Semester', 'Credits', 'Preferred']],
      body: assignments.map(a => [
        a.courseId.courseCode, a.courseId.courseName, `Year ${a.year}`,
        `Semester ${a.semester}`, a.courseId.credits.toString(), a.isPreferred ? 'Yes' : 'No',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5 && assignments[data.row.index]?.isPreferred) {
          data.cell.styles.fillColor = [220, 252, 231];
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    const fileName = `${teacherName.replace(/\s+/g, '-')}-Assignments-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Courses', value: assignments.length, color: 'bg-emerald-500', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Preferred', value: assignments.filter(a => a.isPreferred).length, color: 'bg-amber-500', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { label: 'Total Credits', value: assignments.reduce((sum, a) => sum + (a.courseId?.credits || 0), 0), color: 'bg-blue-500', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">My Assigned Courses</h2>
            <p className="text-xs text-slate-500 mt-0.5">Courses you are teaching this academic year</p>
          </div>
          {assignments.length > 0 && (
            <button onClick={handleDownloadPDF}
              className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors">
              Download PDF
            </button>
          )}
        </div>

        {assignments.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-slate-500">No courses assigned yet</p>
            <p className="text-xs text-slate-400 mt-1">Contact your class advisor for course assignments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Code</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Course Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Year</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Semester</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Credits</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900">{assignment.courseId.courseCode}</td>
                    <td className="px-5 py-3 text-sm text-slate-700">{assignment.courseId.courseName}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">Year {assignment.year}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">Sem {assignment.semester}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{assignment.courseId.credits}</td>
                    <td className="px-5 py-3">
                      {assignment.isPreferred ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">Preferred</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">Assigned</span>
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
  );
}
