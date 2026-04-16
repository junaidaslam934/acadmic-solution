'use client';

import { useState } from 'react';

interface AddTeacherFormProps {
  onTeacherAdded?: () => void;
}

export default function AddTeacherForm({ onTeacherAdded }: AddTeacherFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    specialization: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const specializationArray = formData.specialization
        .split(',')
        .map(spec => spec.trim())
        .filter(spec => spec.length > 0);

      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          employeeId: formData.employeeId,
          specialization: specializationArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType('success');
        setMessage('Teacher added successfully!');
        setFormData({
          name: '',
          email: '',
          employeeId: '',
          specialization: '',
        });
        onTeacherAdded?.();
      } else {
        setMessageType('error');
        setMessage(data.message || 'Error adding teacher');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Teacher</h2>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter teacher name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email address"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
          Employee ID *
        </label>
        <input
          id="employeeId"
          name="employeeId"
          type="text"
          required
          value={formData.employeeId}
          onChange={handleInputChange}
          placeholder="Enter employee ID"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
          Specialization
        </label>
        <textarea
          id="specialization"
          name="specialization"
          value={formData.specialization}
          onChange={handleInputChange}
          placeholder="Enter multiple specializations separated by commas"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Adding Teacher...' : 'Add Teacher'}
      </button>
    </form>
  );
}
