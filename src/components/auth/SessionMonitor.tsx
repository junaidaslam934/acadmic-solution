'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

export default function SessionMonitor() {
  const { data: session, status } = useSession();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  // Inactivity timeout (30 minutes)
  const { getTimeRemaining, extendSession } = useInactivityTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes warning
    onWarning: () => setInactivityWarning(true),
    onTimeout: () => {
      alert('Your session has expired due to inactivity. Please log in again.');
      signOut({ callbackUrl: '/login' });
    }
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.expires) {
      const interval = setInterval(() => {
        const expiresAt = new Date(session.expires).getTime();
        const now = Date.now();
        const remaining = expiresAt - now;

        setTimeLeft(remaining);

        // Show warning when 5 minutes left
        if (remaining <= 5 * 60 * 1000 && remaining > 0) {
          setShowWarning(true);
        }

        // Auto logout when expired
        if (remaining <= 0) {
          clearInterval(interval);
          signOut({ callbackUrl: '/login' });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session, status]);

  const extendSessionHandler = () => {
    extendSession();
    setInactivityWarning(false);
    // Refresh the page to get a new session
    window.location.reload();
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (status !== 'authenticated') {
    return null;
  }

  // Inactivity warning
  if (inactivityWarning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Session Timeout Warning</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Your session will expire in 5 minutes due to inactivity. Do you want to continue your session?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={extendSessionHandler}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Continue Session
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular session expiration warning
  if (showWarning) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Session Expiring Soon</p>
            <p className="text-sm">Time remaining: {formatTime(timeLeft)}</p>
          </div>
          <button
            onClick={extendSessionHandler}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
          >
            Extend
          </button>
        </div>
      </div>
    );
  }

  return null;
}