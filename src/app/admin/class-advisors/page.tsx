'use client';

import { useState, useEffect } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface ClassAdvisor {
  _id: string;
  teacherId: string | {
    _id: string;
    name: string;
    email: string;
    employeeId?: string;
  };
  year: number;
  teacherName?: string;
}

export default function ClassAdvisorsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classAdvisors, setClassAdvisors] = useState<ClassAdvisor[]>([]);
  const [yearAssignments, setYearAssignments] = useState<{ [key: number]: string }>({
    1: '',
    2: '',
    3: '',
    4: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch teachers
      const teachersRes = await fetch('/api/teachers');
      const teachersData = await teachersRes.json();
      
      console.log('Teachers API Response:', teachersData);
      
      // Fetch existing class advisors
      const advisorsRes = await fetch('/api/class-advisors');
      const advisorsData = await advisorsRes.json();
      
      console.log('Advisors API Response:', advisorsData);
      
      if (teachersData.success) {
        const teachersList = teachersData.data || teachersData.teachers || [];
        console.log('Setting teachers:', teachersList);
        setTeachers(teachersList);
      }
      
      if (advisorsData.success) {
        const advisors = advisorsData.data || [];
        setClassAdvisors(advisors);
        
        // Set current assignments
        const assignments: { [key: number]: string } = { 1: '', 2: '', 3: '', 4: '' };
        advisors.forEach((advisor: ClassAdvisor) => {
          // Handle both populated (object) and non-populated (string) teacherId
          const teacherId = typeof advisor.teacherId === 'string' 
            ? advisor.teacherId 
            : advisor.teacherId._id;
          assignments[advisor.year] = teacherId;
        });
        console.log('Year assignments:', assignments);
        setYearAssignments(assignments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearAssignment = (year: number, teacherId: string) => {
    setYearAssignments(prev => ({
      ...prev,
      [year]: teacherId
    }));
  };

  const getAssignedYears = (teacherId: string): number[] => {
    return Object.entries(yearAssignments)
      .filter(([_, id]) => id === teacherId)
      .map(([year]) => parseInt(year));
  };

  const isTeacherAvailable = (teacherId: string, currentYear: number): boolean => {
    const assignedYears = getAssignedYears(teacherId);
    return assignedYears.length === 0 || (assignedYears.length === 1 && assignedYears[0] === currentYear);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Validate: Check if any teacher is assigned to multiple years
      const teacherYearCount: { [key: string]: number[] } = {};
      Object.entries(yearAssignments).forEach(([year, teacherId]) => {
        if (teacherId) {
          if (!teacherYearCount[teacherId]) {
            teacherYearCount[teacherId] = [];
          }
          teacherYearCount[teacherId].push(parseInt(year));
        }
      });

      const duplicates = Object.entries(teacherYearCount).filter(([_, years]) => years.length > 1);
      if (duplicates.length > 0) {
        const teacherName = teachers.find(t => t._id === duplicates[0][0])?.name || 'Unknown';
        setMessage(`Error: ${teacherName} cannot be assigned to multiple years`);
        setSaving(false);
        return;
      }

      // Check if teacher is already assigned to another year in database
      const existingAdvisors = classAdvisors;
      for (const [year, teacherId] of Object.entries(yearAssignments)) {
        if (!teacherId) continue;
        
        const alreadyAssigned = existingAdvisors.find((advisor) => {
          const advisorTeacherId = typeof advisor.teacherId === 'string' 
            ? advisor.teacherId 
            : advisor.teacherId._id;
          return advisorTeacherId === teacherId && advisor.year !== parseInt(year);
        });
        
        if (alreadyAssigned) {
          const teacherName = teachers.find(t => t._id === teacherId)?.name || 'This teacher';
          setMessage(`Error: ${teacherName} is already assigned to Year ${alreadyAssigned.year}`);
          setSaving(false);
          return;
        }
      }

      // Save assignments
      const promises = Object.entries(yearAssignments).map(async ([year, teacherId]) => {
        if (!teacherId) {
          // Delete assignment if empty
          const response = await fetch(`/api/class-advisors?year=${year}`, {
            method: 'DELETE',
          });
          return response.json();
        }

        const response = await fetch('/api/class-advisors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId,
            year: parseInt(year)
          })
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message);
        }
        return result;
      });

      const results = await Promise.all(promises);
      
      // Prepare all advisors data for email notification
      const advisorsData = Object.entries(yearAssignments)
        .filter(([_, teacherId]) => teacherId) // Only include assigned years
        .map(([year, teacherId]) => {
          const teacher = teachers.find(t => t._id === teacherId);
          if (!teacher) return null;
          
          // Find the saved advisor data from results
          const savedAdvisor = results.find(r => r && r.data && r.data.year === parseInt(year));
          const advisorId = savedAdvisor?.data?._id || '';
          
          return {
            email: teacher.email,
            name: teacher.name,
            year: parseInt(year),
            loginId: advisorId,
            message: `You have been assigned as Class Advisor for Year ${year}. Your login ID is: ${advisorId}`
          };
        })
        .filter(Boolean); // Remove null entries
      
      // Send all advisors data in a single request via API proxy
      if (advisorsData.length > 0) {
        try {
          console.log('Sending advisors data:', advisorsData);
          
          const emailResponse = await fetch('/api/send-advisor-emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ advisors: advisorsData })
          });
          
          const emailResult = await emailResponse.json();
          console.log('Email notification result:', emailResult);
          
          if (emailResult.success) {
            setMessage(`Class advisors assigned successfully! Email notifications sent to ${emailResult.advisorsSent} advisor(s).`);
          } else {
            setMessage('Class advisors assigned successfully! (Email notification may have failed - check n8n webhook)');
          }
        } catch (emailError) {
          console.error('Failed to send emails:', emailError);
          setMessage('Class advisors assigned successfully! (Email notification failed)');
        }
      } else {
        setMessage('Class advisors assigned successfully!');
      }
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving assignments:', error);
      setMessage('Error saving assignments');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Assign Class Advisors</h2>
          <p className="text-blue-100 text-sm mt-1">Assign one teacher as class advisor for each year</p>
        </div>

        <div className="p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message.includes('Error') ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {message}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
              <p className="text-2xl font-bold text-blue-900">{teachers.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Assigned Advisors</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.values(yearAssignments).filter(id => id).length} / 4
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((year) => {
              const assignedTeacher = teachers.find(t => t._id === yearAssignments[year]);
              const hasAssignment = !!yearAssignments[year];

              return (
                <div key={year} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Year {year}</h3>
                    {hasAssignment && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Assigned
                      </span>
                    )}
                  </div>

                  {hasAssignment ? (
                    // Show assigned teacher with remove option
                    <div className="bg-white border-2 border-green-500 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Class Advisor</p>
                            <p className="text-lg font-semibold text-gray-900">{assignedTeacher?.name}</p>
                            <p className="text-sm text-gray-600">{assignedTeacher?.department}</p>
                            <p className="text-xs text-gray-500">{assignedTeacher?.email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleYearAssignment(year, '')}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Show dropdown to select teacher
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Class Advisor
                      </label>
                      
                      {/* Debug info */}
                      {teachers.length === 0 && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                          No teachers found. Please add teachers first from the Dashboard.
                        </div>
                      )}
                      
                      <select
                        value=""
                        onChange={(e) => {
                          console.log('Selected teacher ID:', e.target.value);
                          handleYearAssignment(year, e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Choose a teacher... ({teachers.length} available)</option>
                        {teachers.length > 0 ? (
                          teachers.map((teacher) => {
                            const assignedYears = getAssignedYears(teacher._id);
                            const isAssignedElsewhere = assignedYears.length > 0 && !assignedYears.includes(year);
                            
                            console.log(`Teacher ${teacher.name}:`, { 
                              id: teacher._id, 
                              assignedYears, 
                              isAssignedElsewhere 
                            });
                            
                            return (
                              <option 
                                key={teacher._id} 
                                value={teacher._id}
                                disabled={isAssignedElsewhere}
                              >
                                {teacher.name} - {teacher.department}
                                {isAssignedElsewhere ? ` (Assigned to Year ${assignedYears[0]})` : ''}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>No teachers available</option>
                        )}
                      </select>
                      <p className="mt-2 text-xs text-gray-500">
                        Select a teacher to assign as class advisor for Year {year}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
