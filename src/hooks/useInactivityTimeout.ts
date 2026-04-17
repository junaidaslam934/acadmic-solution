'use client';

import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';

interface UseInactivityTimeoutProps {
  timeout?: number; // in milliseconds
  warningTime?: number; // in milliseconds
  onWarning?: () => void;
  onTimeout?: () => void;
}

export function useInactivityTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes default
  warningTime = 5 * 60 * 1000, // 5 minutes warning
  onWarning,
  onTimeout
}: UseInactivityTimeoutProps = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      if (onWarning) {
        onWarning();
      } else {
        const shouldContinue = confirm(
          `Your session will expire in ${Math.floor(warningTime / 60000)} minutes due to inactivity. Click OK to continue your session.`
        );
        if (shouldContinue) {
          resetTimer(); // Reset if user wants to continue
        }
      }
    }, timeout - warningTime);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        alert('Your session has expired due to inactivity. Please log in again.');
        signOut({ callbackUrl: '/login' });
      }
    }, timeout);
  }, [timeout, warningTime, onWarning, onTimeout]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    // Throttle activity detection to avoid excessive timer resets
    let throttleTimer: NodeJS.Timeout;
    const handleActivity = () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      throttleTimer = setTimeout(() => {
        resetTimer();
      }, 1000); // Throttle to once per second
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [resetTimer]);

  const getTimeRemaining = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, timeout - elapsed);
  }, [timeout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    getTimeRemaining,
    extendSession,
    resetTimer
  };
}