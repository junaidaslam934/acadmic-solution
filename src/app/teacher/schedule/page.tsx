'use client';

import { useState, useEffect, useCallback } from 'react';

interface BookingSlot {
  _id: string;
  courseId?: { courseCode: string; courseName: string; abbreviation?: string };
  teacherId?: { _id: string; name: string };
  year: number;
  section: string;
  dayOfWeek: number;
  slotNumber: number;
  startTime: string;
  endTime: string;
  room?: string;
}

interface Assignment {
  _id: string;
  courseId?: { _id: string; courseCode: string; courseName: string };
  year: number;
  semester: number;
  sections?: string[];
  outlineStatus: string;
}

interface Semester {
  _id: string;
  name: string;
  status: string;
  timeSlots?: Array<{ slotNumber: number; startTime: string; endTime: string }>;
  sections?: Record<string, string[]>;
  workingDays?: number[];
}

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SLOTS = [
  { slotNumber: 1, startTime: '08:30', endTime: '09:20' },
  { slotNumber: 2, startTime: '09:20', endTime: '10:10' },
  { slotNumber: 3, startTime: '10:30', endTime: '11:20' },
  { slotNumber: 4, startTime: '11:20', endTime: '12:10' },
  { slotNumber: 5, startTime: '13:00', endTime: '13:50' },
  { slotNumber: 6, startTime: '13:50', endTime: '14:40' },
  { slotNumber: 7, startTime: '14:50', endTime: '15:40' },
  { slotNumber: 8, startTime: '15:40', endTime: '16:30' },
];

export default function SchedulePage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemId, setSelectedSemId] = useState('');
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSection, setSelectedSection] = useState('A');
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Load semesters
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/semesters');
        const data = await res.json();
        const sems: Semester[] = data.data || data.semesters || [];
        setSemesters(sems);
        // Select first scheduling/active semester
        const active = sems.find((s) => s.status === 'scheduling' || s.status === 'active');
        if (active) setSelectedSemId(active._id);
        else if (sems.length > 0) setSelectedSemId(sems[0]._id);
      } catch (err) {
        console.error('Load semesters error:', err);
      }
    };
    load();
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedSemId) return;
    setLoading(true);
    try {
      const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId') || '';
      const [bookingsRes, assignmentsRes] = await Promise.all([
        fetch(
          `/api/bookings?semesterId=${selectedSemId}&year=${selectedYear}&section=${selectedSection}`
        ).then((r) => r.json()),
        fetch(`/api/course-assignments?teacherId=${teacherId}&semesterId=${selectedSemId}`).then(
          (r) => r.json()
        ),
      ]);
      setBookings(bookingsRes.data || []);
      setAssignments(
        (assignmentsRes.data || assignmentsRes.assignments || []).filter(
          (a: Assignment) => a.outlineStatus === 'approved'
        )
      );
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSemId, selectedYear, selectedSection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedSem = semesters.find((s) => s._id === selectedSemId);
  const timeSlots = selectedSem?.timeSlots?.length ? selectedSem.timeSlots : DEFAULT_SLOTS;
  const workingDays = selectedSem?.workingDays?.length ? selectedSem.workingDays : [1, 2, 3, 4, 5];

  const handleBookSlot = async (
    dayOfWeek: number,
    slotNumber: number,
    assignmentId: string,
    courseId: string
  ) => {
    setBooking(true);
    try {
      const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId') || '';
      const slot = timeSlots.find((s) => s.slotNumber === slotNumber);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterId: selectedSemId,
          courseId,
          teacherId,
          assignmentId,
          year: selectedYear,
          section: selectedSection,
          dayOfWeek,
          slotNumber,
          startTime: slot?.startTime || '',
          endTime: slot?.endTime || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Booking failed');
        return;
      }
      fetchData();
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setBooking(false);
    }
  };

  const getBooking = (day: number, slot: number) =>
    bookings.find((b) => b.dayOfWeek === day && b.slotNumber === slot);

  const teacherId = typeof window !== 'undefined'
    ? localStorage.getItem('teacherId') || localStorage.getItem('userId') || ''
    : '';

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={selectedSemId} onChange={(e) => setSelectedSemId(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          {[1, 2, 3, 4].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          {(selectedSem?.sections?.[String(selectedYear)] || ['A', 'B']).map((s: string) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
      </div>

      {/* Timetable grid */}
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-400">
          Loading timetable...
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider w-20">Slot</th>
                {workingDays.map((d) => (
                  <th key={d} className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{DAY_NAMES[d]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot.slotNumber} className="border-b border-slate-50">
                  <td className="px-3 py-2 text-xs text-slate-500">
                    <div className="font-medium">Slot {slot.slotNumber}</div>
                    <div>{slot.startTime}–{slot.endTime}</div>
                  </td>
                  {workingDays.map((day) => {
                    const b = getBooking(day, slot.slotNumber);
                    const isMyBooking = b && b.teacherId?._id === teacherId;
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        {b ? (
                          <div className={`px-2 py-1.5 rounded-md text-xs ${isMyBooking ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                            <p className="font-semibold">{b.courseId?.abbreviation || b.courseId?.courseCode || '?'}</p>
                            <p className="text-[10px] opacity-70">{b.teacherId?.name}</p>
                          </div>
                        ) : assignments.length > 0 && selectedSem?.status === 'scheduling' ? (
                          <BookSlotDropdown assignments={assignments} onBook={(aId, cId) => handleBookSlot(day, slot.slotNumber, aId, cId)} disabled={booking} />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" /> Your classes
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100" /> Other classes
        </div>
      </div>
    </div>
  );
}

function BookSlotDropdown({
  assignments,
  onBook,
  disabled,
}: {
  assignments: Assignment[];
  onBook: (assignmentId: string, courseId: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (assignments.length === 0) return <span className="text-slate-300">—</span>;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-xs text-emerald-600 border border-dashed border-emerald-300 rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-50"
      >
        + Book
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[160px]">
            {assignments.map((a) => (
              <button
                key={a._id}
                onClick={() => {
                  onBook(a._id, a.courseId?._id || '');
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors"
              >
                {a.courseId?.courseCode} — {a.courseId?.courseName}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
