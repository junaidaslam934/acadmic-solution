'use client';

export default function OutlinesPage() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Course Outlines</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Track course outline submissions and their approval status across the review chain 
          (Class Advisor → UG Coordinator → Co-Chairman → Chairman).
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Outlines will appear here once a semester moves to the &quot;Outline Submission&quot; phase and teachers begin uploading.
        </p>
      </div>
    </div>
  );
}
