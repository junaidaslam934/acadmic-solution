'use client';

import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useSession } from 'next-auth/react';

interface ActivityTrackerProps {
  timeout?: number; // Custom timeout in minutes
  children?: React.ReactNode;
}

export default function ActivityTracker({ 
  timeout = 30, // 30 minutes default
  children 
}: ActivityTrackerProps) {
  const { status } = useSession();

  // Only track activity for authenticated users
  useInactivityTimeout({
    timeout: timeout * 60 * 1000, // Convert minutes to milliseconds
    warningTime: 5 * 60 * 1000, // 5 minutes warning
  });

  // This component doesn't render anything visible
  // It just tracks user activity in the background
  if (status !== 'authenticated') {
    return null;
  }

  return children ? <>{children}</> : null;
}