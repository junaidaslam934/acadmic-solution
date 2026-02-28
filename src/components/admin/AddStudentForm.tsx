'use client';

import { useState } from 'react';

interface AddStudentFormProps {
  onStudentAdded?: () => void;
}

export default function AddStudentForm({ onStudentAdded }: AddStudentFormProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    year: 1,
    section: 'A',
    coursesEnrolled: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const coursesArray = formData.coursesEnrolled
        .split(',')
        .map(course => course.trim())
        .filter(course => course.length > 0);

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.studentName,
          rollNumber: formData.rollNumber,
          year: formData.year,
          section: formData.section,
          coursesEnrolled: coursesArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType('success');
        setMessage('Student added successfully!');
        setFormData({
          studentName: '',
          rollNumber: '',
          year: 1,
          section: 'A',
          coursesEnrolled: '',
        });
        onStudentAdded?.();
      } else {
        setMessageType('error');
        setMessage(data.message || 'Error adding student');
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h2>

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
        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
          Student Name *
        </label>
        <input
          id="studentName"
          name="studentName"
          type="text"
          required
          value={formData.studentName}
          onChange={handleInputChange}
          placeholder="Enter student name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Roll Number *
        </label>
        <input
          id="rollNumber"
          name="rollNumber"
          type="text"
          required
          value={formData.rollNumber}
          onChange={handleInputChange}
          placeholder="Enter roll number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
          Year *
        </label>
        <select
          id="year"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={1}>1st Year</option>
          <option value={2}>2nd Year</option>
          <option value={3}>3rd Year</option>
          <option value={4}>4th Year</option>
        </select>
      </div>

      <div>
        <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
          Section *
        </label>
        <select
          id="section"
          name="section"
          value={formData.section}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
      </div>

      <div>
        <label htmlFor="coursesEnrolled" className="block text-sm font-medium text-gray-700 mb-1">
          Courses Enrolled (comma-separated)
        </label>
        <textarea
          id="coursesEnrolled"
          name="coursesEnrolled"
          value={formData.coursesEnrolled}
          onChange={handleInputChange}
          placeholder="e.g., CS101, MATH101, ENG101"
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
        {isLoading ? 'Adding Student...' : 'Add Student'}
      </button>
    </form>
  );
}
