'use client';

import { useState, useEffect, useCallback } from 'react';

interface OutlineDoc {
  _id: string;
  teacherId?: { _id: string; name: string; email: string };
  courseId?: { _id: string; courseCode: string; courseName: string; abbreviation?: string };
  semesterId?: { _id: string; name: string };
  fileUrl: string;
  fileName: string;
  version: number;
  status: string;
  currentReviewerRole: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-700' },
  advisor_review: { label: 'Advisor Review', color: 'bg-blue-100 text-blue-700' },
  coordinator_review: { label: 'Coordinator Review', color: 'bg-indigo-100 text-indigo-700' },
  co_chairman_review: { label: 'Co-Chairman Review', color: 'bg-purple-100 text-purple-700' },
  chairman_review: { label: 'Chairman Review', color: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function ReviewOutlinesPage() {
  const [outlines, setOutlines] = useState<OutlineDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchOutlines = useCallback(async () => {
    setLoading(true);
    try {
      // Get outlines where class_advisor is the current reviewer
      const res = await fetch('/api/outlines?currentReviewerRole=class_advisor');
      const data = await res.json();
      setOutlines(data.data || []);
    } catch (err) {
      console.error('Fetch outlines error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlines();
  }, [fetchOutlines]);

  const handleReview = async (outlineId: string, decision: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      const reviewerId = localStorage.getItem('userId') || localStorage.getItem('classAdvisorId') || '';
      const res = await fetch(`/api/outlines/${outlineId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId,
          reviewerRole: 'class_advisor',
          decision,
          comments,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Review failed');
        return;
      }
      setReviewingId(null);
      setComments('');
      fetchOutlines();
    } catch (err) {
      console.error('Review error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Loading...</div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{outlines.length} outline(s) awaiting your review</p>

      {outlines.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-400">No outlines pending your review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {outlines.map((outline) => (
            <div key={outline._id} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {outline.courseId?.courseCode} — {outline.courseId?.courseName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Teacher: {outline.teacherId?.name || 'Unknown'} · v{outline.version}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submitted {new Date(outline.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold flex-shrink-0 ${STATUS_MAP[outline.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_MAP[outline.status]?.label || outline.status}
                </span>
              </div>

              <div className="mt-3">
                <a href={outline.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {outline.fileName}
                </a>
              </div>

              {reviewingId === outline._id ? (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <textarea value={comments} onChange={(e) => setComments(e.target.value)}
                    placeholder="Comments (optional)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows={3} />
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(outline._id, 'approved')} disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                      {submitting ? 'Submitting...' : 'Approve'}
                    </button>
                    <button onClick={() => handleReview(outline._id, 'rejected')} disabled={submitting}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors">
                      Reject
                    </button>
                    <button onClick={() => { setReviewingId(null); setComments(''); }}
                      className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <button onClick={() => setReviewingId(outline._id)}
                    className="px-3 py-1.5 text-sm text-purple-600 border border-purple-200 rounded-md hover:bg-purple-50 transition-colors font-medium">
                    Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
