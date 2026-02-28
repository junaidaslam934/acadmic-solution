'use client';

import { useState } from 'react';
import CSVGuide from './CSVGuide';

interface FileUploadState {
  [key: string]: File | null;
}

const requiredFiles = [
  { key: 'courses', label: 'Courses CSV', description: 'Upload: courses.csv - Subject codes, names, and credits', expectedFile: 'courses.csv' },
  { key: 'teachers', label: 'Teachers CSV', description: 'Upload: teachers (1).csv - Teacher IDs, names, and subjects', expectedFile: 'teachers (1).csv' },
  { key: 'timeslots', label: 'Timeslots CSV', description: 'Upload: timeslots.csv - Available time slots for classes', expectedFile: 'timeslots.csv' },
  { key: 'rooms', label: 'Rooms CSV', description: 'Upload: rooms.csv - Room numbers and capacities', expectedFile: 'rooms.csv' },
  { key: 'constraints', label: 'Constraints CSV', description: 'Upload: constraints.csv - Scheduling rules and restrictions', expectedFile: 'constraints.csv' },
  { key: 'year_info', label: 'Year Info CSV', description: 'Upload: year_info.csv - Academic year and semester information', expectedFile: 'year_info.csv' }
];

export default function FileUploadForm() {
  const [files, setFiles] = useState<FileUploadState>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [useDirectUpload, setUseDirectUpload] = useState(false);
  const [testMode, setTestMode] = useState(false);

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setUploadStatus('error');
        setStatusMessage(`Please upload a CSV file for ${requiredFiles.find(f => f.key === key)?.label}`);
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus('error');
        setStatusMessage(`File size too large. Please upload a CSV file smaller than 10MB.`);
        return;
      }
      
      // Clear any previous error messages
      if (uploadStatus === 'error') {
        setUploadStatus('idle');
        setStatusMessage('');
      }
    }
    
    setFiles(prev => ({
      ...prev,
      [key]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all files are uploaded
    const missingFiles = requiredFiles.filter(file => !files[file.key]);
    if (missingFiles.length > 0) {
      setUploadStatus('error');
      setStatusMessage(`Please upload all required files. Missing: ${missingFiles.map(f => f.label).join(', ')}`);
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      // Create FormData to send files
      const formData = new FormData();
      
      // Add all files to FormData
      requiredFiles.forEach(fileConfig => {
        const file = files[fileConfig.key];
        if (file) {
          formData.append(fileConfig.key, file);
        }
      });

      // Add metadata
      formData.append('timestamp', new Date().toISOString());
      formData.append('admin_id', 'admin_user'); // You can make this dynamic

      console.log('Starting upload with files:', Object.keys(files).filter(key => files[key]));
      
      // Test mode - simulate successful upload
      if (testMode) {
        console.log('Test mode - simulating upload...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        setUploadStatus('success');
        setStatusMessage('Test upload completed successfully! (No actual files were sent)');
        
        // Clear files after successful upload
        setFiles({});
        
        // Reset form inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        fileInputs.forEach(input => {
          input.value = '';
        });
        
        return;
      }
      
      let response;
      let result;
      
      if (useDirectUpload) {
        // Direct upload to n8n webhook
        console.log('Using direct upload to n8n webhook');
        response = await fetch('https://n8n.algoace.agency/webhook-test/timetable-generate', {
          method: 'POST',
          body: formData,
        });
        
        console.log('Direct n8n response status:', response.status);
        
        // Read response body once and handle both success and error cases
        let responseBody;
        try {
          responseBody = await response.text();
        } catch (readError) {
          responseBody = 'Could not read response';
        }
        
        if (response.ok) {
          // Try to parse as JSON, fallback to text
          try {
            result = JSON.parse(responseBody);
          } catch {
            result = responseBody;
          }
          
          setUploadStatus('success');
          setStatusMessage('Files uploaded successfully to n8n! Timetable generation started.');
        } else {
          throw new Error(`Direct upload failed: ${response.status} ${response.statusText} - ${responseBody}`);
        }
      } else {
        // Call our API route which forwards to n8n webhook
        console.log('Using API route upload');
        response = await fetch('/api/upload-timetable', {
          method: 'POST',
          body: formData,
        });

        console.log('API response status:', response.status);
        
        // Read response body once
        let responseBody;
        try {
          responseBody = await response.text();
        } catch (readError) {
          responseBody = 'Could not read response';
        }
        
        // Try to parse as JSON
        try {
          result = JSON.parse(responseBody);
          console.log('API response:', result);
        } catch (jsonError) {
          // If JSON parsing fails, create error object with text response
          result = { success: false, message: responseBody };
        }

        if (response.ok && result?.success) {
          setUploadStatus('success');
          setStatusMessage('Files uploaded successfully! Timetable generation started.');
        } else {
          const errorMessage = result?.message || `Upload failed: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }
      }
      
      // Clear files after successful upload
      setFiles({});
      
      // Reset form inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => {
        input.value = '';
      });
      
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const allFilesUploaded = requiredFiles.every(file => files[file.key]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredFiles.map((fileConfig) => (
          <div key={fileConfig.key} className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {fileConfig.label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">{fileConfig.description}</p>
            
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(fileConfig.key, e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
              />
            </div>
            
            {files[fileConfig.key] && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <span className="mr-2">✓</span>
                <span className="truncate">{files[fileConfig.key]?.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-lg ${
          uploadStatus === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : uploadStatus === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {uploadStatus === 'success' ? '✓' : uploadStatus === 'error' ? '✗' : 'i'}
            </span>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Upload Progress</span>
          <span className="text-sm text-gray-500">
            {Object.keys(files).filter(key => files[key]).length} / {requiredFiles.length} files
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys(files).filter(key => files[key]).length / requiredFiles.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Upload Options */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={useDirectUpload}
            onChange={(e) => setUseDirectUpload(e.target.checked)}
            disabled={testMode}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Use Direct Upload</span>
            <p className="text-xs text-gray-500">Upload directly to n8n webhook (bypass API route)</p>
          </div>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Test Mode</span>
            <p className="text-xs text-gray-500">Simulate upload without sending files (for testing UI)</p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!allFilesUploaded || isUploading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
          !allFilesUploaded || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {useDirectUpload ? 'Uploading to n8n...' : 'Uploading & Generating Timetable...'}
          </div>
        ) : (
          `Upload Files & Generate Timetable ${useDirectUpload ? '(Direct)' : ''}`
        )}
      </button>

      {/* Your Files Mapping */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">📁 Your Files to Upload:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700">
          <div>• <strong>Courses:</strong> courses.csv</div>
          <div>• <strong>Teachers:</strong> teachers (1).csv</div>
          <div>• <strong>Timeslots:</strong> timeslots.csv</div>
          <div>• <strong>Rooms:</strong> rooms.csv</div>
          <div>• <strong>Constraints:</strong> constraints.csv</div>
          <div>• <strong>Year Info:</strong> year_info.csv</div>
        </div>
      </div>

      {/* File Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-blue-800">📋 File Requirements:</h4>
          <CSVGuide />
        </div>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Accepted format: CSV files only (.csv)</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• All 6 CSV files are required for timetable generation</li>
          <li>• Files will be processed by our AI timetable generator</li>
          <li>• Ensure CSV files have proper headers and are comma-separated</li>
        </ul>
      </div>

      {/* n8n Webhook Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">🔗 n8n Webhook Setup:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Webhook URL: https://n8n.algoace.agency/webhook-test/timetable-generate</li>
          <li>• If you get a 404 error, activate your n8n workflow first</li>
          <li>• In n8n: Click 'Execute workflow' button to activate the webhook</li>
          <li>• Test mode webhooks only work for one call after activation</li>
        </ul>
      </div>
    </form>
  );
}