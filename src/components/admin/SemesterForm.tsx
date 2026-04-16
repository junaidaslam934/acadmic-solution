'use client';

import { useEffect, useState } from 'react';

interface Semester {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function SemesterForm() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/semesters');
      const data = await response.json();
      if (data.success) {
        setSemesters(data.semesters);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setMessage('Error loading semesters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, name, startDate, endDate }
        : { name, startDate, endDate };

      const response = await fetch('/api/semesters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(editingId ? 'Semester updated successfully' : 'Semester created successfully');
        setName('');
        setStartDate('');
        setEndDate('');
        setEditingId(null);
        fetchSemesters();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to save semester');
      }
    } catch (error) {
      console.error('Error saving semester:', error);
      setMessage('Error saving semester');
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingId(semester._id);
    setName(semester.name);
    setStartDate(semester.startDate.split('T')[0]);
    setEndDate(semester.endDate.split('T')[0]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;

    try {
      const response = await fetch(`/api/semesters?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Semester deleted successfully');
        fetchSemesters();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete semester');
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
      setMessage('Error deleting semester');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setStartDate('');
    setEndDate('');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Semesters</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fall 2024, Spring 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes('success')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            {editingId ? 'Update Semester' : 'Create Semester'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Semesters List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Semesters</h3>
        {semesters.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No semesters created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((semester) => {
                  const start = new Date(semester.startDate);
                  const end = new Date(semester.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={semester._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{semester.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {start.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {end.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{days} days</td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(semester)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(semester._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
