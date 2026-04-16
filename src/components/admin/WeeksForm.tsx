'use client';

import { useState, useEffect } from 'react';

interface Week {
  weekNumber: number;
  startDate: string;
  endDate: string;
  isHoliday: boolean;
  holidayReason: string;
}

interface WeeksFormProps {
  semesterId: string;
  onSuccess?: () => void;
}

export default function WeeksForm({ semesterId, onSuccess }: WeeksFormProps) {
  const [weeks, setWeeks] = useState<Week[]>(
    Array.from({ length: 15 }, (_, i) => ({
      weekNumber: i + 1,
      startDate: '',
      endDate: '',
      isHoliday: false,
      holidayReason: '',
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingWeeks, setExistingWeeks] = useState<any[]>([]);
  const [savingWeek, setSavingWeek] = useState<number | null>(null);

  useEffect(() => {
    fetchExistingWeeks();
  }, [semesterId]);

  const fetchExistingWeeks = async () => {
    try {
      const response = await fetch(`/api/generate-weeks?semesterId=${semesterId}`);
      const data = await response.json();
      if (data.success && data.weeks.length > 0) {
        const formattedWeeks = data.weeks.map((w: any) => ({
          weekNumber: w.weekNumber,
          startDate: new Date(w.startDate).toISOString().split('T')[0],
          endDate: new Date(w.endDate).toISOString().split('T')[0],
          isHoliday: w.isHoliday,
          holidayReason: w.holidayReason || '',
        }));
        setWeeks(formattedWeeks);
        setExistingWeeks(data.weeks);
      }
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const handleWeekChange = (index: number, field: string, value: any) => {
    const updated = [...weeks];
    updated[index] = { ...updated[index], [field]: value };
    setWeeks(updated);
  };

  const handleSaveWeek = async (index: number) => {
    const week = weeks[index];

    // Validate week has dates
    if (!week.startDate || !week.endDate) {
      setMessage(`Week ${week.weekNumber}: Both start and end dates are required`);
      return;
    }

    // Validate dates
    if (new Date(week.startDate) >= new Date(week.endDate)) {
      setMessage(`Week ${week.weekNumber}: Start date must be before end date`);
      return;
    }

    try {
      setSavingWeek(week.weekNumber);
      const response = await fetch('/api/generate-weeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semesterId, weeks: [week] }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Week ${week.weekNumber} saved successfully`);
        setExistingWeeks([...existingWeeks, data.weeks[0]]);
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(data.error || `Failed to save week ${week.weekNumber}`);
      }
    } catch (error) {
      console.error('Error saving week:', error);
      setMessage(`Error saving week ${week.weekNumber}`);
    } finally {
      setSavingWeek(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Semester Weeks</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {existingWeeks.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            {existingWeeks.length} weeks already configured for this semester
          </p>
        </div>
      )}

      <form>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {weeks.map((week, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Week {week.weekNumber}</h3>
                <button
                  type="button"
                  onClick={() => handleSaveWeek(index)}
                  disabled={savingWeek === week.weekNumber}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {savingWeek === week.weekNumber ? 'Saving...' : 'Save Week'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={week.startDate}
                    onChange={(e) =>
                      handleWeekChange(index, 'startDate', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={week.endDate}
                    onChange={(e) =>
                      handleWeekChange(index, 'endDate', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  id={`holiday-${index}`}
                  checked={week.isHoliday}
                  onChange={(e) =>
                    handleWeekChange(index, 'isHoliday', e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor={`holiday-${index}`}
                  className="text-sm font-medium text-gray-700"
                >
                  Mark as Holiday
                </label>
              </div>

              {week.isHoliday && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holiday Reason
                  </label>
                  <input
                    type="text"
                    value={week.holidayReason}
                    onChange={(e) =>
                      handleWeekChange(index, 'holidayReason', e.target.value)
                    }
                    placeholder="e.g., Winter Break"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
