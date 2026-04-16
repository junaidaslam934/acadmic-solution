'use client';

import { useState } from 'react';

interface RoutineMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface DailyRoutine {
  id: string;
  title: string;
  description: string;
  time: string;
  period: 'morning' | 'afternoon' | 'night';
  media?: RoutineMedia;
}

export default function DailyRoutineForm() {
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Track which routine is being updated
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '',
    period: 'morning' as 'morning' | 'afternoon' | 'night'
  });

  const handleMediaUpdate = async (routineId: string, file: File) => {
    setIsUpdating(routineId); // Show loader for this specific routine
    
    try {
      // Hide existing preview by removing media temporarily
      setRoutines(prev => prev.map(routine => 
        routine.id === routineId 
          ? { ...routine, media: undefined } 
          : routine
      ));

      // Simulate media upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create media object
      const mediaUrl = URL.createObjectURL(file);
      const newMedia: RoutineMedia = {
        id: Date.now().toString(),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: mediaUrl,
        name: file.name
      };

      // Update routine with new media
      setRoutines(prev => prev.map(routine => 
        routine.id === routineId 
          ? { ...routine, media: newMedia }
          : routine
      ));

    } catch (error) {
      console.error('Media update failed:', error);
      // Handle error - maybe show error message
    } finally {
      setIsUpdating(null); // Hide loader
    }
  };

  const handleAddRoutine = () => {
    if (!formData.title || !formData.time) return;

    const newRoutine: DailyRoutine = {
      id: Date.now().toString(),
      ...formData
    };

    setRoutines(prev => [...prev, newRoutine]);
    setFormData({
      title: '',
      description: '',
      time: '',
      period: 'morning'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Daily Routine Manager</h1>

      {/* Add Routine Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Routine</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Morning Exercise"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
          <select
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your routine..."
          />
        </div>

        <button
          onClick={handleAddRoutine}
          disabled={!formData.title || !formData.time}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Routine
        </button>
      </div>

      {/* Routines List */}
      <div className="space-y-4">
        {routines.map((routine) => (
          <div key={routine.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{routine.title}</h3>
                <p className="text-sm text-gray-500">
                  {routine.time} • {routine.period.charAt(0).toUpperCase() + routine.period.slice(1)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleMediaUpdate(routine.id, file);
                    }
                  }}
                  className="hidden"
                  id={`media-${routine.id}`}
                />
                <label
                  htmlFor={`media-${routine.id}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg cursor-pointer text-sm"
                >
                  {routine.media ? 'Update Media' : 'Add Media'}
                </label>
              </div>
            </div>

            {routine.description && (
              <p className="text-gray-600 mb-4">{routine.description}</p>
            )}

            {/* Media Section */}
            <div className="border-t pt-4">
              {isUpdating === routine.id ? (
                // Show loader when updating this routine
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-gray-500">Updating media...</p>
                  </div>
                </div>
              ) : routine.media ? (
                // Show media preview when not updating
                <div className="media-preview">
                  <p className="text-sm font-medium text-gray-700 mb-2">Media:</p>
                  {routine.media.type === 'image' ? (
                    <img
                      src={routine.media.url}
                      alt={routine.media.name}
                      className="max-w-xs h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={routine.media.url}
                      controls
                      className="max-w-xs h-32 rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{routine.media.name}</p>
                </div>
              ) : (
                // Show placeholder when no media
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-500">No media added yet</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {routines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No routines added yet. Create your first routine above!</p>
          </div>
        )}
      </div>
    </div>
  );
}