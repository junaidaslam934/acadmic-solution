'use client';

import { useState, useEffect } from 'react';

interface Assessment {
  _id: string;
  name: string;
  type: 'practical' | 'quiz' | 'midterm' | 'final';
  totalMarks: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface AssessmentManagerProps {
  courseId: string;
  assessments: Assessment[];
  onAssessmentCreated: (assessment: Assessment) => void;
  onAssessmentUpdated: (assessment: Assessment) => void;
  onAssessmentDeleted: (assessmentId: string) => void;
  onStartGrading: (assessment: Assessment) => void;
}

export default function AssessmentManager({
  courseId,
  assessments,
  onAssessmentCreated,
  onAssessmentUpdated,
  onAssessmentDeleted,
  onStartGrading
}: AssessmentManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'quiz' as 'practical' | 'quiz' | 'midterm' | 'final',
    totalMarks: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'quiz',
      totalMarks: '',
      description: ''
    });
    setShowCreateForm(false);
    setEditingAssessment(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        setError('Teacher ID not found. Please log in again.');
        return;
      }

      const url = editingAssessment 
        ? `/api/grading/assessments/${editingAssessment._id}`
        : '/api/grading/assessments';
      
      const method = editingAssessment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          teacherId,
          name: formData.name.trim(),
          type: formData.type,
          totalMarks: parseInt(formData.totalMarks),
          description: formData.description.trim() || undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (editingAssessment) {
          onAssessmentUpdated(data.assessment);
        } else {
          onAssessmentCreated(data.assessment);
        }
        resetForm();
      } else {
        setError(data.message || 'Failed to save assessment');
      }
    } catch (err) {
      setError('Failed to save assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      name: assessment.name,
      type: assessment.type,
      totalMarks: assessment.totalMarks.toString(),
      description: assessment.description || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (assessmentId: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    try {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId) {
        alert('Teacher ID not found. Please log in again.');
        return;
      }

      const response = await fetch(`/api/grading/assessments/${assessmentId}?teacherId=${teacherId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onAssessmentDeleted(assessmentId);
      } else {
        alert(data.message || 'Failed to delete assessment');
      }
    } catch (err) {
      alert('Failed to delete assessment');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'practical': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-blue-100 text-blue-800';
      case 'midterm': return 'bg-orange-100 text-orange-800';
      case 'final': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'practical': return '🔬';
      case 'quiz': return '📝';
      case 'midterm': return '📊';
      case 'final': return '🎯';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assessments</h3>
          <p className="text-sm text-gray-600">
            Create and manage assessments for this course
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Assessment
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingAssessment ? 'Edit Assessment' : 'Create New Assessment'}
          </h4>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Quiz 1, Midterm Exam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="practical">Practical</option>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks *
              </label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
                required
                min="1"
                max="1000"
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Additional details about this assessment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (editingAssessment ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first assessment to start grading students
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <div key={assessment._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTypeIcon(assessment.type)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{assessment.name}</h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.type)}`}>
                      {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  Total Marks: <span className="font-medium text-gray-900">{assessment.totalMarks}</span>
                </div>
                {assessment.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {assessment.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Created: {new Date(assessment.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onStartGrading(assessment)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Grade Students
                </button>
                <button
                  onClick={() => handleEdit(assessment)}
                  className="px-3 py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(assessment._id)}
                  className="px-3 py-2 text-red-600 border border-red-300 rounded text-sm hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}