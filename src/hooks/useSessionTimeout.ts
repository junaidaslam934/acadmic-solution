'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionTimeout() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (status === 'authenticated' && session?.expires) {
      const expiresAt = new Date(session.expires).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Clear existing timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);

      // Show warning 5 minutes before expiry
      const warningTime = timeUntilExpiry - (5 * 60 * 1000);
      if (warningTime > 0) {
        warningRef.current = setTimeout(() => {
          const shouldExtend = confirm(
            'Your session will expire in 5 minutes. Do you want to extend it?'
          );
          if (shouldExtend) {
            // Refresh the session by making a request
            window.location.reload();
          }
        }, warningTime);
      }

      // Auto logout when session expires
      if (timeUntilExpiry > 0) {
        timeoutRef.current = setTimeout(() => {
          alert('Your session has expired. Please log in again.');
          signOut({ callbackUrl: '/login' });
        }, timeUntilExpiry);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [session, status, router]);

  return {
    isExpired: status === 'unauthenticated',
    timeUntilExpiry: session?.expires ? new Date(session.expires).getTime() - Date.now() : 0
  };
}