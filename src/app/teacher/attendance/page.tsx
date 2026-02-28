'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceTracker from '@/components/teacher/AttendanceTracker';

export default function TeacherAttendancePage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get teacher ID from localStorage
    const id = localStorage.getItem('teacherId');
    if (id) {
      setTeacherId(id);
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="text-center py-8 text-sm text-slate-400">Loading...</div>;
  }

  if (!teacherId) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-4">
      <AttendanceTracker teacherId={teacherId} />
    </div>
  );
}
