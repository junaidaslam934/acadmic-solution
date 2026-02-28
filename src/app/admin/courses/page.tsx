'use client';

import { useState, useEffect, useCallback } from 'react';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  abbreviation?: string;
  year: number;
  semester: number;
  credits: number;
  type?: string;
  department?: string;
  isActive?: boolean;
}

const YEAR_OPTIONS = [1, 2, 3, 4];
const TYPE_OPTIONS = [
  { value: 'theory', label: 'Theory' },
  { value: 'lab', label: 'Lab' },
  { value: 'both', label: 'Both' },
];

const INPUT = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const SELECT = INPUT + ' appearance-none';

const initialForm = { courseCode: '', courseName: '', abbreviation: '', year: 1, semester: 1, credits: 3, type: 'theory', department: '' };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = yearFilter ? `?year=${yearFilter}` : '';
      const res = await fetch(`/api/courses${params}`);
      const data = await res.json();
      setCourses(data.data?.courses || data.courses || []);
    } catch (err) { console.error('Fetch error:', err); }
    finally { setLoading(false); }
  }, [yearFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openCreate = () => { setEditing(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ courseCode: c.courseCode, courseName: c.courseName, abbreviation: c.abbreviation || '', year: c.year, semester: c.semester, credits: c.credits, type: c.type || 'theory', department: c.department || '' });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const url = editing ? `/api/courses/${editing._id}` : '/api/courses';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setShowModal(false); fetchCourses();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to save'); }
    finally { setSaving(false); }
  };

  const grouped = courses.reduce<Record<number, Course[]>>((acc, c) => {
    const y = c.year || 0;
    if (!acc[y]) acc[y] = [];
    acc[y].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Years</option>
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <span className="text-sm text-slate-600 font-medium">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Course
        </button>
      </div>

      {/* Courses grouped by year */}
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center text-slate-500 text-sm">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center">
          <p className="text-slate-500 text-sm mb-1">No courses found.</p>
          <button onClick={openCreate} className="text-xs text-blue-600 hover:underline">Add your first course</button>
        </div>
      ) : (
        Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(yearKey => {
          const year = Number(yearKey);
          const yc = grouped[year];
          return (
            <div key={year} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Year {year} <span className="text-slate-400 font-normal normal-case">({yc.length})</span></h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Code</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Sem</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Cr.</th>
                      <th className="text-right px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {yc.map(c => (
                      <tr key={c._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2 font-mono text-slate-900 font-medium text-xs">{c.courseCode}</td>
                        <td className="px-4 py-2">
                          <p className="text-slate-900">{c.courseName}</p>
                          {c.abbreviation && <p className="text-[11px] text-slate-400">{c.abbreviation}</p>}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium capitalize">{c.type || 'theory'}</span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">{c.semester}</td>
                        <td className="px-4 py-2 text-slate-600">{c.credits}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">{editing ? 'Edit Course' : 'Add Course'}</h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <Field label="Course Code">
                  <input type="text" value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} className={INPUT} placeholder="CS301" />
                </Field>
                <Field label="Abbreviation">
                  <input type="text" value={form.abbreviation} onChange={e => setForm({ ...form, abbreviation: e.target.value.toUpperCase() })} className={INPUT} placeholder="MBSD" />
                </Field>
              </div>
              <Field label="Course Name">
                <input type="text" value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} className={INPUT} placeholder="Mobile-Based Software Development" />
              </Field>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Year">
                  <select value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} className={SELECT}>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Semester">
                  <select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} className={SELECT}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </Field>
                <Field label="Credits">
                  <input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} className={INPUT} min={1} max={6} />
                </Field>
                <Field label="Type">
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={SELECT}>
                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Department">
                <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className={INPUT} placeholder="Computer Science" />
              </Field>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.courseCode || !form.courseName} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-40 transition">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
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
