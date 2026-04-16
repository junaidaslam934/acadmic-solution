'use client';

import { useState } from 'react';

interface MediaUploaderProps {
  routineId: string;
  currentMedia?: {
    id: string;
    type: 'image' | 'video';
    url: string;
    name: string;
  };
  onMediaUpdate: (routineId: string, file: File) => Promise<void>;
  isUpdating: boolean;
}

export default function MediaUploader({ 
  routineId, 
  currentMedia, 
  onMediaUpdate, 
  isUpdating 
}: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      onMediaUpdate(routineId, file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="border-t pt-4">
      {isUpdating ? (
        // Loader - hides existing preview
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm text-gray-600 font-medium">Updating media...</p>
            <p className="text-xs text-gray-500 mt-1">Please wait while we process your file</p>
          </div>
        </div>
      ) : currentMedia ? (
        // Media Preview
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Current Media:</p>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id={`update-media-${routineId}`}
            />
            <label
              htmlFor={`update-media-${routineId}`}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg cursor-pointer text-sm font-medium"
            >
              Replace
            </label>
          </div>
          
          <div className="media-container">
            {currentMedia.type === 'image' ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.name}
                className="max-w-sm h-40 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <video
                src={currentMedia.url}
                controls
                className="max-w-sm h-40 rounded-lg shadow-sm"
              >
                Your browser does not support the video tag.
              </video>
            )}
            <p className="text-xs text-gray-500 mt-2">{currentMedia.name}</p>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-2">
            <div className="text-gray-400 text-3xl">📁</div>
            <p className="text-sm text-gray-600">
              Drag and drop media here, or{' '}
              <label className="text-blue-600 cursor-pointer font-medium">
                browse files
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">Supports images and videos</p>
          </div>
        </div>
      )}
    </div>
  );
}