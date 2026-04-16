'use client';

import { useState } from 'react';

const csvExamples = {
  courses: `course_code,course_name,credits,hours_per_week
MATH101,Mathematics I,3,4
PHY101,Physics I,3,4
ENG101,English Literature,2,3`,
  
  teachers: `teacher_id,teacher_name,email,courses,max_hours_per_week
T001,Dr. John Smith,john@university.edu,"MATH101,MATH102",20
T002,Prof. Jane Doe,jane@university.edu,"PHY101,PHY102",18
T003,Dr. Bob Wilson,bob@university.edu,ENG101,15`,
  
  timeslots: `slot_id,day,start_time,end_time,duration
TS001,Monday,09:00,10:00,60
TS002,Monday,10:00,11:00,60
TS003,Tuesday,09:00,10:00,60`,
  
  rooms: `room_id,room_name,capacity,type,equipment
R101,Room 101,50,Lecture,"Projector,Whiteboard"
R102,Room 102,30,Lab,"Computers,Projector"
R103,Room 103,60,Lecture,"Projector,Audio System"`,
  
  constraints: `constraint_type,description,applies_to,value
MAX_HOURS_PER_DAY,Maximum hours per day,teacher,6
MIN_BREAK_BETWEEN_CLASSES,Minimum break between classes,all,15
NO_BACK_TO_BACK_LABS,No consecutive lab sessions,class,true`,
  
  year_info: `academic_year,semester,start_date,end_date,total_weeks
2024-2025,Fall,2024-09-01,2024-12-15,16
2024-2025,Spring,2025-01-15,2025-05-15,16`
};

export default function CSVGuide() {
  const [activeTab, setActiveTab] = useState('subjects');
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { key: 'courses', label: 'Courses' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'timeslots', label: 'Timeslots' },
    { key: 'rooms', label: 'Rooms' },
    { key: 'constraints', label: 'Constraints' },
    { key: 'year_info', label: 'Year Info' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
      >
        📋 View CSV Format Guide
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">CSV Format Guide</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-1/4 border-r bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900 mb-4">File Types</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {tabs.find(t => t.key === activeTab)?.label} CSV Format
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Example CSV Content:</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">
                {csvExamples[activeTab as keyof typeof csvExamples]}
              </pre>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Important Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use comma (,) as the delimiter</li>
                  <li>• Include headers in the first row</li>
                  <li>• Use double quotes for fields containing commas</li>
                  <li>• Ensure consistent data types in each column</li>
                  <li>• Save file with .csv extension</li>
                </ul>
              </div>

              {activeTab === 'teachers' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> For subjects column, use comma-separated values within quotes if a teacher handles multiple subjects.
                  </p>
                </div>
              )}

              {activeTab === 'constraints' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Constraints help the AI understand scheduling rules and limitations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Need help? Contact support for sample CSV files.
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}