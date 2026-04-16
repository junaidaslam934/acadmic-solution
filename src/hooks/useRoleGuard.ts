'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRoleGuard(allowedRoles: string[]) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push('/login');
      return;
    }

    const userRole = session.user?.role;
    const localRole = localStorage.getItem('userRole');

    // Check both session role and localStorage role
    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push('/unauthorized');
      return;
    }

    // Additional check with localStorage
    if (localRole && !allowedRoles.includes(localRole)) {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router, allowedRoles]);

  return {
    isLoading: status === 'loading',
    isAuthorized: session && allowedRoles.includes(session.user?.role || ''),
    user: session?.user
  };
}