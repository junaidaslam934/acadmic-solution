'use client';

export default function TimetablesPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Timetables</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          View generated timetables for each year and section. Teachers book slots on a first-come-first-served basis during the scheduling phase.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Timetable data will appear here once a semester reaches the &quot;Scheduling&quot; phase and teachers begin booking slots.
        </p>
      </div>
    </div>
  );
}
