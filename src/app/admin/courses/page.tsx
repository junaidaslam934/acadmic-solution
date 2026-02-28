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

const initialForm = {
  courseCode: '',
  courseName: '',
  abbreviation: '',
  year: 1,
  semester: 1,
  credits: 3,
  type: 'theory',
  department: '',
};

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
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  }, [yearFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      courseCode: course.courseCode,
      courseName: course.courseName,
      abbreviation: course.abbreviation || '',
      year: course.year,
      semester: course.semester,
      credits: course.credits,
      type: course.type || 'theory',
      department: course.department || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = editing ? `/api/courses/${editing._id}` : '/api/courses';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setShowModal(false);
      fetchCourses();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Group courses by year
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
        <div className="flex gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 flex items-center">
            {courses.length} course(s)
          </span>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Course
        </button>
      </div>

      {/* Courses grouped by year */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Loading...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-2">No courses found.</p>
          <button onClick={openCreate} className="text-sm text-blue-600 hover:underline">
            Add your first course
          </button>
        </div>
      ) : (
        Object.keys(grouped)
          .sort((a, b) => Number(a) - Number(b))
          .map((yearKey) => {
            const year = Number(yearKey);
            const yearCourses = grouped[year];
            return (
              <div key={year} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">
                    Year {year}{' '}
                    <span className="text-gray-400 font-normal">({yearCourses.length})</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                          Code
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                          Sem
                        </th>
                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                          Credits
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {yearCourses.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-gray-900">{c.courseCode}</td>
                          <td className="px-4 py-2.5">
                            <div>
                              <p className="text-gray-900">{c.courseName}</p>
                              {c.abbreviation && (
                                <p className="text-xs text-gray-400">{c.abbreviation}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                              {c.type || 'theory'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{c.semester}</td>
                          <td className="px-4 py-2.5 text-gray-600">{c.credits}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? 'Edit Course' : 'Add Course'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={form.courseCode}
                    onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CS301"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abbreviation
                  </label>
                  <input
                    type="text"
                    value={form.abbreviation}
                    onChange={(e) => setForm({ ...form, abbreviation: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MBSD"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mobile-Based Software Development"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Computer Science"
                />
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
                disabled={saving || !form.courseCode || !form.courseName}
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
