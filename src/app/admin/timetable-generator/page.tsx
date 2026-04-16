'use client';

import { useState } from 'react';
import FileUploadForm from '@/components/admin/FileUploadForm';
import CSVGuide from '@/components/admin/CSVGuide';

export default function TimetableGeneratorPage() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Timetable Generator
            </h2>
            <p className="text-gray-600">
              Upload your CSV files to generate optimized timetables
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            {showGuide ? 'Hide Guide' : 'Show CSV Guide'}
          </button>
        </div>
      </div>

      {/* CSV Guide Section */}
      {showGuide && (
        <div className="mb-8 animate-fadeIn">
          <CSVGuide />
        </div>
      )}

      {/* Upload Form Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Files
          </h2>
          <p className="text-gray-600">
            Upload your teacher preferences, course data, and classroom information
          </p>
        </div>
        
        <FileUploadForm />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">CSV Format</h3>
            </div>
          <p className="text-gray-600 text-sm">
            Ensure your CSV files follow the required format for accurate timetable generation
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Fast Processing</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Our AI-powered system generates optimized timetables in seconds
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Conflict-Free</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Automatically resolves scheduling conflicts and optimizes resource allocation
          </p>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recent Generations
        </h2>
        <div className="text-gray-600 text-center py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>No recent timetable generations</p>
          <p className="text-sm mt-2">Upload files to generate your first timetable</p>
        </div>
      </div>
    </div>
  );
}
