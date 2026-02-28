'use client';

import { useState, useEffect, useCallback } from 'react';

interface Semester {
  _id: string;
  name: string;
  academicYear: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  sections?: Record<string, string[]>;
  classAdvisors?: Array<{ year: number; userId?: { _id: string; name: string } }>;
  outlineDeadline?: string;
  schedulingDeadline?: string;
}

const STATUS_OPTIONS = [
  'planning',
  'course_assignment',
  'outline_submission',
  'outline_review',
  'scheduling',
  'active',
  'completed',
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'bg-gray-100 text-gray-700' },
  course_assignment: { label: 'Course Assignment', color: 'bg-blue-100 text-blue-700' },
  outline_submission: { label: 'Outline Submission', color: 'bg-yellow-100 text-yellow-700' },
  outline_review: { label: 'Outline Review', color: 'bg-orange-100 text-orange-700' },
  scheduling: { label: 'Scheduling', color: 'bg-purple-100 text-purple-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
};

const WORKFLOW_STEPS = STATUS_OPTIONS;

const initialForm = {
  name: '',
  academicYear: '',
  type: 'fall' as string,
  startDate: '',
  endDate: '',
  outlineDeadline: '',
  schedulingDeadline: '',
};

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Semester | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/semesters');
      const data = await res.json();
      setSemesters(data.data || data.semesters || []);
    } catch (err) {
      console.error('Fetch semesters error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (sem: Semester) => {
    setEditing(sem);
    setForm({
      name: sem.name,
      academicYear: sem.academicYear || '',
      type: sem.type || 'fall',
      startDate: sem.startDate ? sem.startDate.split('T')[0] : '',
      endDate: sem.endDate ? sem.endDate.split('T')[0] : '',
      outlineDeadline: sem.outlineDeadline ? sem.outlineDeadline.split('T')[0] : '',
      schedulingDeadline: sem.schedulingDeadline ? sem.schedulingDeadline.split('T')[0] : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = '/api/semesters';
      const method = editing ? 'PUT' : 'POST';
      const body: Record<string, unknown> = { ...form };
      if (editing) body._id = editing._id;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setShowModal(false);
      fetchSemesters();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStatus = async (sem: Semester) => {
    const currentIdx = STATUS_OPTIONS.indexOf(sem.status);
    if (currentIdx < 0 || currentIdx >= STATUS_OPTIONS.length - 1) return;
    const nextStatus = STATUS_OPTIONS[currentIdx + 1];

    try {
      const res = await fetch('/api/semesters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: sem._id, status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to advance');
      }
      fetchSemesters();
    } catch (err) {
      console.error('Advance error:', err);
    }
  };

  const handleDelete = async (sem: Semester) => {
    if (!confirm(`Delete semester "${sem.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/semesters?id=${sem._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
        return;
      }
      fetchSemesters();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{semesters.length} semester(s)</p>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Semester
        </button>
      </div>

      {/* Semesters list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Loading...
        </div>
      ) : semesters.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-2">No semesters yet.</p>
          <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
            Create your first semester
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {semesters.map((sem) => {
            const isExpanded = expandedId === sem._id;
            const statusIdx = STATUS_OPTIONS.indexOf(sem.status || 'planning');
            const canAdvance = statusIdx >= 0 && statusIdx < STATUS_OPTIONS.length - 1;

            return (
              <div
                key={sem._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : sem._id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{sem.name}</h3>
                      <p className="text-xs text-gray-500">
                        {sem.academicYear || ''}{' '}
                        {sem.startDate &&
                          `· ${new Date(sem.startDate).toLocaleDateString()} – ${new Date(sem.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[sem.status]?.color || 'bg-gray-100 text-gray-600'}`}
                    >
                      {STATUS_LABELS[sem.status]?.label || sem.status || 'Planning'}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Workflow stepper */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      {WORKFLOW_STEPS.map((step, i) => {
                        const isDone = i < statusIdx;
                        const isCurrent = i === statusIdx;
                        return (
                          <div key={step} className="flex items-center flex-shrink-0">
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : isDone
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {STATUS_LABELS[step]?.label || step}
                            </div>
                            {i < WORKFLOW_STEPS.length - 1 && (
                              <div
                                className={`w-3 h-0.5 mx-0.5 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Type</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {sem.type || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Academic Year</p>
                        <p className="font-medium text-gray-900">
                          {sem.academicYear || 'N/A'}
                        </p>
                      </div>
                      {sem.outlineDeadline && (
                        <div>
                          <p className="text-gray-500 text-xs">Outline Deadline</p>
                          <p className="font-medium text-gray-900">
                            {new Date(sem.outlineDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {sem.schedulingDeadline && (
                        <div>
                          <p className="text-gray-500 text-xs">Scheduling Deadline</p>
                          <p className="font-medium text-gray-900">
                            {new Date(sem.schedulingDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Sections */}
                    {sem.sections && Object.keys(sem.sections).length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sections</p>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(sem.sections).map(([year, secs]) => (
                            <span
                              key={year}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
                            >
                              Year {year}: {Array.isArray(secs) ? secs.join(', ') : String(secs)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openEdit(sem)}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      {canAdvance && (
                        <button
                          onClick={() => handleAdvanceStatus(sem)}
                          className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Advance to{' '}
                          {STATUS_LABELS[STATUS_OPTIONS[statusIdx + 1]]?.label}
                        </button>
                      )}
                      {sem.status === 'planning' && (
                        <button
                          onClick={() => handleDelete(sem)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? 'Edit Semester' : 'Create Semester'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Fall 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2025-2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fall">Fall</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outline Deadline
                  </label>
                  <input
                    type="date"
                    value={form.outlineDeadline}
                    onChange={(e) => setForm({ ...form, outlineDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduling Deadline
                  </label>
                  <input
                    type="date"
                    value={form.schedulingDeadline}
                    onChange={(e) => setForm({ ...form, schedulingDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.startDate || !form.endDate}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
