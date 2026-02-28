'use client';

import { useState, useEffect } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  specialization: string[];
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
      if (data.success) setTeachers(data.teachers || []);
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
    <div className="space-y-5">
      {/* Add Preference Form */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Add Teacher Preference</h3>
        </div>
        
        <div className="p-5">
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleAddPreference} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Teacher</label>
                <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>{teacher.name} - {teacher.specialization?.join(', ') || 'N/A'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required>
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>{course.courseCode} - {course.courseName} (Year {course.year})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preference Level</label>
              <div className="flex gap-4">
                {(['high', 'medium', 'low'] as const).map((level) => (
                  <label key={level} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                    <input type="radio" value={level} checked={preferenceLevel === level}
                      onChange={(e) => setPreferenceLevel(e.target.value as 'high' | 'medium' | 'low')}
                      className="text-purple-600 focus:ring-purple-500" />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3} placeholder="Add any additional notes about this preference..." />
            </div>
            
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
              {loading ? 'Adding...' : 'Add Preference'}
            </button>
          </form>
        </div>
      </div>

      {/* Preferences Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Teacher Preferences</h3>
          <p className="text-xs text-slate-500 mt-0.5">View and manage all teacher course preferences</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Teacher</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Course</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Year/Sem</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Preference</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Notes</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preferences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    No preferences added yet. Add your first preference above.
                  </td>
                </tr>
              ) : (
                preferences.map((pref) => (
                  <tr key={pref._id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{pref.teacherId.name}</p>
                      <p className="text-xs text-slate-500">{pref.teacherId.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{pref.courseId.courseCode}</p>
                      <p className="text-xs text-slate-500">{pref.courseId.courseName}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">
                      Y{pref.courseId.year} · S{pref.courseId.semester}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${getPreferenceBadgeColor(pref.preferenceLevel)}`}>
                        {pref.preferenceLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 max-w-[200px] truncate">
                      {pref.notes || '–'}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDeletePreference(pref._id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
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

      {/* Info */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-purple-800 mb-1">About Preferences</h4>
        <p className="text-xs text-purple-700">
          Teacher preferences help in course assignment decisions. When you assign a course to a teacher who has marked it as preferred, 
          the system will automatically flag it as a &ldquo;Preferred Assignment&rdquo; in the course assignments page.
        </p>
      </div>
    </div>
  );
}
