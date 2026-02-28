'use client';

import { useState } from 'react';

interface PDFUploadState {
  file: File | null;
}

export default function PDFUploadForm() {
  const [state, setState] = useState<PDFUploadState>({ file: null });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploadStatus('error');
        setStatusMessage('Please upload a PDF file');
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setUploadStatus('error');
        setStatusMessage('File size too large. Please upload a PDF smaller than 50MB.');
        return;
      }

      // Clear any previous error messages
      if (uploadStatus === 'error') {
        setUploadStatus('idle');
        setStatusMessage('');
      }
    }

    setState({ file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.file) {
      setUploadStatus('error');
      setStatusMessage('Please select a PDF file to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    try {
      // Convert PDF to base64
      const file = state.file;
      if (!file) {
        throw new Error('No file selected');
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('Uploading PDF:', file.name);

      // Send to n8n webhook with base64 encoded PDF
      const response = await fetch('https://junniauto.app.n8n.cloud/webhook-test/pdf-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileBase64: base64,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin_user',
        }),
      });

      console.log('Upload response status:', response.status);

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        result = { success: false, message: 'Invalid response from server' };
      }

      if (response.ok) {
        setUploadStatus('success');
        setStatusMessage(`PDF uploaded successfully! File: ${file.name}`);
        setState({ file: null });

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        const errorMessage = result?.message || `Upload failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <div className="mb-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>

        <label className="block">
          <span className="sr-only">Choose PDF file</span>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
          />
        </label>

        <p className="text-sm text-gray-600 mt-2">
          Click to select a PDF file or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Maximum file size: 50MB
        </p>
      </div>

      {/* Selected File Display */}
      {state.file && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0015.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">{state.file.name}</p>
                <p className="text-sm text-blue-700">
                  {(state.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFileChange(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg ${
            uploadStatus === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : uploadStatus === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">
              {uploadStatus === 'success' ? '✓' : uploadStatus === 'error' ? '✗' : 'i'}
            </span>
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!state.file || isUploading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
          !state.file || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Uploading PDF...
          </div>
        ) : (
          'Upload PDF'
        )}
      </button>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📄 PDF Upload Information:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Accepted format: PDF files only (.pdf)</li>
          <li>• Maximum file size: 50MB</li>
          <li>• Upload documents, reports, or schedules</li>
          <li>• Files are securely stored and can be accessed later</li>
        </ul>
      </div>
    </form>
  );
}
