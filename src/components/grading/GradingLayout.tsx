'use client';

import { useState } from 'react';
import CourseCard from './CourseCard';
import AssessmentModal from './AssessmentModal';

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

interface GradingLayoutProps {
  assignments: CourseAssignment[];
  onRefresh: () => void;
}

export default function GradingLayout({ assignments, onRefresh }: GradingLayoutProps) {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseAssignment | null>(null);

  const handleCreateAssessment = (assignment: CourseAssignment) => {
    setSelectedCourse(assignment);
    setShowAssessmentModal(true);
  };

  const handleAssessmentCreated = () => {
    setShowAssessmentModal(false);
    setSelectedCourse(null);
    onRefresh();
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Assigned</h3>
        <p className="text-gray-600">
          You don't have any courses assigned for grading yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Courses</h2>
        <p className="text-gray-600">
          Select a course to manage assessments and grade students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <CourseCard
            key={assignment._id}
            assignment={assignment}
            onCreateAssessment={handleCreateAssessment}
          />
        ))}
      </div>

      {showAssessmentModal && selectedCourse && (
        <AssessmentModal
          courseId={selectedCourse.courseId._id}
          courseName={`${selectedCourse.courseId.courseCode} - ${selectedCourse.courseId.courseName}`}
          onClose={() => setShowAssessmentModal(false)}
          onAssessmentCreated={handleAssessmentCreated}
        />
      )}
    </div>
  );
}