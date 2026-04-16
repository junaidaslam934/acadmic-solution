'use client';

import { useRouter } from 'next/navigation';

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  year: number;
  semester: number;
  credits: number;
}

interface CourseAssignment {
  _id: string;
  courseId: Course;
  year: number;
  semester: number;
  assessmentCount?: number;
}

interface CourseCardProps {
  assignment: CourseAssignment;
  onCreateAssessment: (assignment: CourseAssignment) => void;
}

export default function CourseCard({ assignment, onCreateAssessment }: CourseCardProps) {
  const router = useRouter();
  const { courseId, assessmentCount = 0 } = assignment;

  const handleGradeStudents = () => {
    router.push(`/teacher/grading/${assignment._id}`); // Use assignment ID instead of course ID
  };

  const handleCreateAssessment = () => {
    onCreateAssessment(assignment);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {courseId.courseCode}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {courseId.courseName}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Year {courseId.year}</div>
          <div>Semester {courseId.semester}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Credits:</span>
          <span className="font-medium">{courseId.credits}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Assessments:</span>
          <span className="font-medium">
            {assessmentCount === 0 ? (
              <span className="text-orange-600">No assessments yet</span>
            ) : (
              <span className="text-green-600">{assessmentCount} created</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleGradeStudents}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Grade Students
        </button>
        <button
          onClick={handleCreateAssessment}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          title="Create Assessment"
        >
          + Assessment
        </button>
      </div>
    </div>
  );
}