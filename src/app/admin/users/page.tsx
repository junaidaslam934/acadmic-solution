'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  advisorYear?: number;
  teacherId?: { _id: string; employeeId?: string };
  createdAt: string;
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'chairman', label: 'Chairman' },
  { value: 'co_chairman', label: 'Co-Chairman' },
  { value: 'ug_coordinator', label: 'UG Coordinator' },
  { value: 'class_advisor', label: 'Class Advisor' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  chairman: 'bg-purple-100 text-purple-800',
  co_chairman: 'bg-indigo-100 text-indigo-800',
  ug_coordinator: 'bg-blue-100 text-blue-800',
  class_advisor: 'bg-cyan-100 text-cyan-800',
  teacher: 'bg-emerald-100 text-emerald-800',
  student: 'bg-slate-100 text-slate-700',
};

// Shared input class for consistent styling
const INPUT = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const SELECT = INPUT + ' appearance-none';

const initialForm = { name: '', email: '', password: '', role: 'teacher' as string, advisorYear: '' as string | number };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => { setEditingUser(null); setForm(initialForm); setError(''); setShowModal(true); };
  const openEdit = (u: User) => { setEditingUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, advisorYear: u.advisorYear || '' }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;
      if (form.role === 'class_advisor' && form.advisorYear) body.advisorYear = Number(form.advisorYear);
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save user');
      setShowModal(false); fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await fetch(`/api/users/${u._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !u.isActive }) });
      fetchUsers();
    } catch (err) { console.error('Toggle error:', err); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white placeholder-slate-400 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">No users found.</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-[11px] font-bold text-slate-600">{u.name?.charAt(0).toUpperCase() || '?'}</div>
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                      {ROLES.find(r => r.value === u.role)?.label || u.role}
                      {u.role === 'class_advisor' && u.advisorYear ? ` (Y${u.advisorYear})` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleToggleActive(u)} className={`p-1.5 rounded transition ${u.isActive ? 'text-slate-400 hover:text-red-600' : 'text-slate-400 hover:text-emerald-600'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {u.isActive
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-4 py-2.5 flex items-center justify-between bg-slate-50">
            <p className="text-xs text-slate-600 font-medium">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-40 hover:bg-white transition text-slate-700">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md disabled:opacity-40 hover:bg-white transition text-slate-700">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">{editingUser ? 'Edit User' : 'Create User'}</h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              {error && <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
              <Field label="Name">
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={INPUT} placeholder="Full name" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={INPUT} placeholder="user@example.com" />
              </Field>
              <Field label={editingUser ? 'Password (leave blank to keep)' : 'Password'}>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={INPUT} placeholder={editingUser ? '••••••••' : 'Min 8 characters'} />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={SELECT}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              {form.role === 'class_advisor' && (
                <Field label="Advisor Year">
                  <select value={form.advisorYear} onChange={e => setForm({ ...form, advisorYear: e.target.value })} className={SELECT}>
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </Field>
              )}
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.email || (!editingUser && !form.password)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-40 transition">
                {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
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
