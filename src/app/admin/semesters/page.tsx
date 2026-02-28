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

const STATUS_ORDER = [
  'planning', 'course_assignment', 'outline_submission', 'outline_review', 'scheduling', 'active', 'completed',
];

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  planning: { label: 'Planning', cls: 'bg-slate-100 text-slate-700' },
  course_assignment: { label: 'Course Assignment', cls: 'bg-blue-100 text-blue-800' },
  outline_submission: { label: 'Outline Submission', cls: 'bg-amber-100 text-amber-800' },
  outline_review: { label: 'Outline Review', cls: 'bg-orange-100 text-orange-800' },
  scheduling: { label: 'Scheduling', cls: 'bg-violet-100 text-violet-800' },
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600' },
};

const INPUT = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const SELECT = INPUT + ' appearance-none';

const initialForm = {
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
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);

  const openCreate = () => { setEditing(null); setForm(initialForm); setError(''); setShowModal(true); };

  const openEdit = (sem: Semester) => {
    setEditing(sem);
    setForm({
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

  // Auto-generated display name from type + academic year
  const generatedName = form.type && form.academicYear
    ? `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} ${form.academicYear}`
    : '';

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        academicYear: form.academicYear,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      if (form.outlineDeadline) body.outlineDeadline = form.outlineDeadline;
      if (form.schedulingDeadline) body.schedulingDeadline = form.schedulingDeadline;
      if (editing) body._id = editing._id;

      const res = await fetch('/api/semesters', {
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
    } finally { setSaving(false); }
  };

  const handleAdvance = async (sem: Semester) => {
    const idx = STATUS_ORDER.indexOf(sem.status);
    if (idx < 0 || idx >= STATUS_ORDER.length - 1) return;
    try {
      const res = await fetch('/api/semesters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: sem._id, status: STATUS_ORDER[idx + 1] }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      fetchSemesters();
    } catch (err) { console.error('Advance error:', err); }
  };

  const handleDelete = async (sem: Semester) => {
    if (!confirm(`Delete "${sem.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/semesters?id=${sem._id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed'); return; }
      fetchSemesters();
    } catch (err) { console.error('Delete error:', err); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-medium">{semesters.length} semester{semesters.length !== 1 ? 's' : ''}</p>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Semester
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center text-slate-500 text-sm">Loading...</div>
      ) : semesters.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
          <p className="text-slate-500 text-sm mb-1">No semesters yet.</p>
          <button onClick={openCreate} className="text-xs text-blue-600 hover:underline">Create your first semester</button>
        </div>
      ) : (
        <div className="space-y-2">
          {semesters.map(sem => {
            const expanded = expandedId === sem._id;
            const statusIdx = STATUS_ORDER.indexOf(sem.status || 'planning');
            const canAdvance = statusIdx >= 0 && statusIdx < STATUS_ORDER.length - 1;

            return (
              <div key={sem._id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Row header */}
                <button
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition text-left"
                  onClick={() => setExpandedId(expanded ? null : sem._id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{sem.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {sem.academicYear}{sem.startDate && ` · ${new Date(sem.startDate).toLocaleDateString()} – ${new Date(sem.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Badge status={sem.status} />
                </button>

                {/* Expanded */}
                {expanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    {/* Workflow stepper */}
                    <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
                      {STATUS_ORDER.map((step, i) => {
                        const done = i < statusIdx;
                        const cur = i === statusIdx;
                        return (
                          <div key={step} className="flex items-center flex-shrink-0">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${cur ? 'bg-blue-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                              {done && <span className="mr-0.5">&#10003;</span>}{STATUS_LABELS[step]?.label || step}
                            </div>
                            {i < STATUS_ORDER.length - 1 && <div className={`w-2.5 h-px mx-0.5 ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <InfoCell label="Type" value={sem.type ? sem.type.charAt(0).toUpperCase() + sem.type.slice(1) : 'N/A'} />
                      <InfoCell label="Academic Year" value={sem.academicYear || 'N/A'} />
                      {sem.outlineDeadline && <InfoCell label="Outline Deadline" value={new Date(sem.outlineDeadline).toLocaleDateString()} />}
                      {sem.schedulingDeadline && <InfoCell label="Scheduling Deadline" value={new Date(sem.schedulingDeadline).toLocaleDateString()} />}
                    </div>

                    {/* Sections */}
                    {sem.sections && Object.keys(sem.sections).length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Sections</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {Object.entries(sem.sections).map(([year, secs]) => (
                            <span key={year} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              Year {year}: {Array.isArray(secs) ? secs.join(', ') : String(secs)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => openEdit(sem)} className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition">Edit</button>
                      {canAdvance && (
                        <button onClick={() => handleAdvance(sem)} className="px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition">
                          Advance to {STATUS_LABELS[STATUS_ORDER[statusIdx + 1]]?.label}
                        </button>
                      )}
                      {sem.status === 'planning' && (
                        <button onClick={() => handleDelete(sem)} className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition">Delete</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">{editing ? 'Edit Semester' : 'Create Semester'}</h3>
              {generatedName && (
                <p className="text-xs text-slate-500 mt-0.5">Name: <span className="font-medium text-slate-700">{generatedName}</span></p>
              )}
            </div>
            <div className="px-5 py-4 space-y-4">
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Semester Type">
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={SELECT}>
                    <option value="fall">Fall</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                  </select>
                </Field>
                <Field label="Academic Year">
                  <input type="text" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className={INPUT} placeholder="2025-2026" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date">
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={INPUT} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={INPUT} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Outline Deadline (optional)">
                  <input type="date" value={form.outlineDeadline} onChange={e => setForm({ ...form, outlineDeadline: e.target.value })} className={INPUT} />
                </Field>
                <Field label="Scheduling Deadline (optional)">
                  <input type="date" value={form.schedulingDeadline} onChange={e => setForm({ ...form, schedulingDeadline: e.target.value })} className={INPUT} />
                </Field>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.academicYear || !form.startDate || !form.endDate}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-40 transition"
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

function Badge({ status }: { status: string }) {
  const s = STATUS_LABELS[status];
  return <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${s?.cls || 'bg-slate-100 text-slate-600'}`}>{s?.label || status || 'Unknown'}</span>;
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
