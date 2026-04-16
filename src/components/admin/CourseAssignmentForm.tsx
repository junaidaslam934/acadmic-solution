'use client';

import { useEffect, useState } from 'react';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  specialization: string[];
}

interface Course {
  _id?: string;
  courseCode: string;
  courseName: string;
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  totalCreditHours?: number;
  credits?: number; // For backward compatibility
  lectureHours?: number;
  labHours?: number;
  tutorialHours?: number;
  department?: string;
}

interface CourseGroup {
  course: Course;
  year: number;
  semester: number;
  teachers: {
    teacher: Teacher;
    creditHours: number;
    teachingRole: string;
    responsibilities: string[];
    isPreferred: boolean;
    assignmentId: string;
  }[];
  totalAssignedHours: number;
}

interface CourseAssignmentFormProps {
  refreshTrigger?: number;
  onAssignmentAdded?: () => void;
}

export default function CourseAssignmentForm({ refreshTrigger, onAssignmentAdded }: CourseAssignmentFormProps) {
  const [activeYear, setActiveYear] = useState<1 | 2 | 3 | 4>(1);
  const [activeSemester, setActiveSemester] = useState<1 | 2>(1);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [creditHours, setCreditHours] = useState(1);
  const [teachingRole, setTeachingRole] = useState<'primary' | 'secondary' | 'lab' | 'tutorial'>('primary');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [isPreferred, setIsPreferred] = useState(false);
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showAddForm, setShowAddForm] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchAssignments();
  }, [activeYear, activeSemester]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Loading teachers and courses...');
      
      const [teachersRes, coursesRes] = await Promise.all([
        fetch('/api/teachers'),
        fetch('/api/courses'),
      ]);

      const teachersData = await teachersRes.json();
      const coursesData = await coursesRes.json();

      console.log('Teachers Response:', teachersData);
      console.log('Courses Response:', coursesData);

      if (teachersData.success && teachersData.teachers) {
        setTeachers(teachersData.teachers);
        setDebugInfo(`Loaded ${teachersData.teachers.length} teachers`);
      } else {
        setDebugInfo(`Error loading teachers: ${teachersData.message || 'Unknown error'}`);
      }

      if (coursesData.success && coursesData.courses) {
        setCourses(coursesData.courses);
        setDebugInfo(prev => `${prev} | Loaded ${coursesData.courses.length} courses`);
      } else {
        setDebugInfo(prev => `${prev} | Error loading courses: ${coursesData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setDebugInfo(`Error: ${error}`);
      setMessage('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/course-assignments?year=${activeYear}&semester=${activeSemester}`);
      const data = await response.json();
      if (data.success) {
        setCourseGroups(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedCourse || !creditHours) {
      setMessage('Please fill all required fields');
      return;
    }

    try {
      const course = courses.find(c => c._id === selectedCourse);
      if (!course) {
        setMessage('Course not found');
        return;
      }

      const response = await fetch('/api/course-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          courseId: selectedCourse,
          year: activeYear,
          semester: activeSemester,
          creditHours,
          teachingRole,
          responsibilities,
          isPreferred,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Teacher assigned successfully');
        setSelectedTeacher('');
        setSelectedCourse('');
        setCreditHours(1);
        setTeachingRole('primary');
        setResponsibilities([]);
        setIsPreferred(false);
        setShowAddForm(false);
        fetchAssignments();
        onAssignmentAdded?.();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to assign teacher');
      }
    } catch (error) {
      console.error('Error assigning teacher:', error);
      setMessage('Error assigning teacher');
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      const response = await fetch(`/api/course-assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchAssignments();
        onAssignmentAdded?.();
      } else {
        setMessage('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage('Error deleting assignment');
    }
  };

  const handleResponsibilityChange = (responsibility: string, checked: boolean) => {
    if (checked) {
      setResponsibilities([...responsibilities, responsibility]);
    } else {
      setResponsibilities(responsibilities.filter(r => r !== responsibility));
    }
  };

  const getAvailableCreditHours = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (!course) return 0;
    
    const courseTotalHours = course.totalCreditHours || course.credits || 3;
    const courseGroup = courseGroups.find(g => g.course._id === courseId);
    if (!courseGroup) return courseTotalHours;
    
    return courseTotalHours - courseGroup.totalAssignedHours;
  };

  const yearCourses = courses.filter(c => c.year === activeYear && c.semester === activeSemester);
  const yearCourseGroups = courseGroups.filter(g => g.year === activeYear && g.semester === activeSemester);
  
  const responsibilityOptions = ['lectures', 'labs', 'tutorials', 'grading', 'assignments', 'projects', 'exams'];

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Multi-Teacher Course Assignments</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Assignment'}
        </button>
      </div>

      {/* Year Tabs */}
      <div className="flex gap-2 mb-2 border-b">
        {[1, 2, 3, 4].map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year as 1 | 2 | 3 | 4)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeYear === year
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Year {year}
          </button>
        ))}
      </div>

      {/* Semester Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[1, 2].map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSemester(sem as 1 | 2)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSemester === sem
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      {/* Assignment Form */}
      {showAddForm && (
        <form onSubmit={handleAssign} className="mb-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Teacher Assignment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select course</option>
                {yearCourses.map((course) => {
                  const available = getAvailableCreditHours(course._id!);
                  const totalHours = course.totalCreditHours || course.credits || 3;
                  return (
                    <option key={course._id} value={course._id} disabled={available <= 0}>
                      {course.courseCode} - {course.courseName} ({available}/{totalHours}h available)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Hours</label>
              <input
                type="number"
                min="1"
                max={selectedCourse ? getAvailableCreditHours(selectedCourse) : 6}
                value={creditHours}
                onChange={(e) => setCreditHours(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Role</label>
              <select
                value={teachingRole}
                onChange={(e) => setTeachingRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Primary Teacher</option>
                <option value="secondary">Secondary Teacher</option>
                <option value="lab">Lab Instructor</option>
                <option value="tutorial">Tutorial Instructor</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
              <div className="flex flex-wrap gap-2">
                {responsibilityOptions.map((resp) => (
                  <label key={resp} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={responsibilities.includes(resp)}
                      onChange={(e) => handleResponsibilityChange(resp, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">{resp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPreferred}
                  onChange={(e) => setIsPreferred(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Preferred Assignment</span>
              </label>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Add Assignment
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Course Assignments Display */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Year {activeYear}, Semester {activeSemester} Course Assignments
        </h3>
        
        {yearCourseGroups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No course assignments for Year {activeYear}, Semester {activeSemester}</p>
        ) : (
          <div className="space-y-6">
            {yearCourseGroups.map((courseGroup, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {courseGroup.course.courseCode} - {courseGroup.course.courseName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total Credit Hours: {courseGroup.course.totalCreditHours || courseGroup.course.credits || 3} | 
                      Assigned: {courseGroup.totalAssignedHours} | 
                      Remaining: {(courseGroup.course.totalCreditHours || courseGroup.course.credits || 3) - courseGroup.totalAssignedHours}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    courseGroup.totalAssignedHours === (courseGroup.course.totalCreditHours || courseGroup.course.credits || 3)
                      ? 'bg-green-100 text-green-800'
                      : courseGroup.totalAssignedHours > (courseGroup.course.totalCreditHours || courseGroup.course.credits || 3)
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {courseGroup.totalAssignedHours === (courseGroup.course.totalCreditHours || courseGroup.course.credits || 3)
                      ? 'Fully Assigned'
                      : courseGroup.totalAssignedHours > (courseGroup.course.totalCreditHours || courseGroup.course.credits || 3)
                      ? 'Over Assigned'
                      : 'Partially Assigned'
                    }
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Teacher</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Role</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Credit Hours</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Responsibilities</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Preferred</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseGroup.teachers.map((teacherAssignment, teacherIdx) => (
                        <tr key={teacherIdx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {teacherAssignment.teacher.name}
                            <br />
                            <span className="text-gray-500">({teacherAssignment.teacher.employeeId})</span>
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              teacherAssignment.teachingRole === 'primary' ? 'bg-blue-100 text-blue-800' :
                              teacherAssignment.teachingRole === 'secondary' ? 'bg-purple-100 text-purple-800' :
                              teacherAssignment.teachingRole === 'lab' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {teacherAssignment.teachingRole}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                            {teacherAssignment.creditHours}h
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {teacherAssignment.responsibilities.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {teacherAssignment.responsibilities.map((resp, respIdx) => (
                                  <span key={respIdx} className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded text-xs">
                                    {resp}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {teacherAssignment.isPreferred ? (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <button
                              onClick={() => handleDelete(teacherAssignment.assignmentId)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-xs text-gray-600 font-mono">{debugInfo}</p>
        <p className="text-xs text-gray-600 font-mono mt-1">
          Year {activeYear}, Sem {activeSemester}: {yearCourses.length} courses available
        </p>
        {yearCourses.length > 0 && (
          <p className="text-xs text-gray-600 font-mono mt-1">
            Sample courses: {yearCourses.slice(0, 3).map(c => c.courseCode).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}