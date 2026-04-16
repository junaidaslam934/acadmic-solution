'use client';

import { useState, useEffect } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
}

interface Preference {
  _id: string;
  teacherId: { _id: string; name: string; email: string };
  courseId: { _id: string; courseCode: string; courseName: string; year: number; semester: number };
  preferenceLevel: 'high' | 'medium' | 'low';
  notes?: string;
}

export default function TeacherPreferencesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [preferenceLevel, setPreferenceLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
    fetchPreferences();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) setTeachers(data.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/teacher-preferences');
      const data = await res.json();
      if (data.success) setPreferences(data.preferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacher || !selectedCourse) {
      setMessage('❌ Please select both teacher and course');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/teacher-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          courseId: selectedCourse,
          preferenceLevel,
          notes,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ Preference added successfully!');
        setSelectedTeacher('');
        setSelectedCourse('');
        setPreferenceLevel('medium');
        setNotes('');
        fetchPreferences();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to add preference');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeletePreference = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preference?')) return;
    
    try {
      const res = await fetch(`/api/teacher-preferences?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage('✅ Preference deleted successfully!');
        fetchPreferences();
      }
    } catch (error) {
      setMessage('❌ Failed to delete preference');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getPreferenceBadgeColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Add Preference Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Add Teacher Preference</h3>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleAddPreference} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Teacher
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              >
                <option value="">Choose a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.department}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseCode} - {course.courseName} (Year {course.year})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preference Level
            </label>
            <div className="flex space-x-4">
              {(['high', 'medium', 'low'] as const).map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    value={level}
                    checked={preferenceLevel === level}
                    onChange={(e) => setPreferenceLevel(e.target.value as 'high' | 'medium' | 'low')}
                    className="mr-2"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={3}
              placeholder="Add any additional notes about this preference..."
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Preference'}
          </button>
        </form>
      </div>

      {/* Preferences List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Teacher Preferences</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage all teacher course preferences</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year/Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {preferences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No preferences added yet. Add your first preference above.
                  </td>
                </tr>
              ) : (
                preferences.map((pref) => (
                  <tr key={pref._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{pref.teacherId.name}</div>
                      <div className="text-gray-500 text-xs">{pref.teacherId.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{pref.courseId.courseCode}</div>
                      <div className="text-gray-500 text-xs">{pref.courseId.courseName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Year {pref.courseId.year}, Sem {pref.courseId.semester}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPreferenceBadgeColor(pref.preferenceLevel)}`}>
                        {pref.preferenceLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {pref.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDeletePreference(pref._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="font-semibold text-purple-900 mb-2">About Preferences</h4>
        <p className="text-sm text-purple-800">
          Teacher preferences help in course assignment decisions. When you assign a course to a teacher who has marked it as preferred, 
          the system will automatically flag it as a "Preferred Assignment" in the course assignments page.
        </p>
      </div>
    </div>
  );
}
