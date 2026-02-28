'use client';

import { useState, useEffect, useCallback } from 'react';

interface Assignment {
  _id: string;
  courseId?: {
    _id: string;
    courseCode: string;
    courseName: string;
    credits: number;
    abbreviation?: string;
    type?: string;
  };
  semesterId?: { _id: string; name: string; status: string };
  year: number;
  semester: number;
  sections?: string[];
  outlineStatus: string;
  isShared?: boolean;
}

const OUTLINE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-600' },
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-700' },
  advisor_review: { label: 'Advisor Review', color: 'bg-blue-100 text-blue-700' },
  coordinator_review: { label: 'Coordinator Review', color: 'bg-indigo-100 text-indigo-700' },
  co_chairman_review: { label: 'Co-Chairman Review', color: 'bg-purple-100 text-purple-700' },
  chairman_review: { label: 'Chairman Review', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function MyCoursesPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [outlineUrl, setOutlineUrl] = useState('');

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId') || '';
      if (!teacherId) return;
      const res = await fetch(`/api/course-assignments?teacherId=${teacherId}`);
      const data = await res.json();
      setAssignments(data.data || data.assignments || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleSubmitOutline = async (assignment: Assignment) => {
    if (!outlineUrl.trim()) {
      alert('Please enter an outline file URL');
      return;
    }

    try {
      const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId') || '';
      const res = await fetch('/api/outlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: assignment._id,
          teacherId,
          courseId: assignment.courseId?._id,
          semesterId: assignment.semesterId?._id || '',
          fileUrl: outlineUrl.trim(),
          fileName: `${assignment.courseId?.courseCode || 'outline'}_outline.pdf`,
          fileType: 'pdf',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit outline');
        return;
      }
      setSubmittingId(null);
      setOutlineUrl('');
      fetchAssignments();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{assignments.length} course(s) assigned to you</p>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No courses assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const status = OUTLINE_STATUS_MAP[a.outlineStatus] || OUTLINE_STATUS_MAP.pending;
            const canSubmit = a.outlineStatus === 'pending' || a.outlineStatus === 'rejected';

            return (
              <div key={a._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {a.courseId?.courseCode || 'N/A'} — {a.courseId?.courseName || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Year {a.year} &middot; Semester {a.semester}{' '}
                      {a.courseId?.credits ? `· ${a.courseId.credits} Credits` : ''}
                      {a.sections?.length ? ` · Sections: ${a.sections.join(', ')}` : ''}
                    </p>
                    {a.semesterId && (
                      <p className="text-xs text-gray-400 mt-1">
                        {a.semesterId.name}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Outline submission */}
                {canSubmit && submittingId === a._id ? (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outline File URL
                      </label>
                      <input
                        type="url"
                        value={outlineUrl}
                        onChange={(e) => setOutlineUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="https://drive.google.com/... or cloudinary URL"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Upload your outline PDF somewhere and paste the link here.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSubmitOutline(a)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Submit Outline
                      </button>
                      <button
                        onClick={() => {
                          setSubmittingId(null);
                          setOutlineUrl('');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : canSubmit ? (
                  <div className="mt-3">
                    <button
                      onClick={() => setSubmittingId(a._id)}
                      className="px-3 py-1.5 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Submit Outline
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
