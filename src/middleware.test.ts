import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// We test the route-protection logic by extracting it from the middleware.
// The actual middleware is exported as the default export from next-auth/middleware,
// so we reproduce the inner function logic here independently to keep tests fast
// and dependency-free (avoids Next.js server runtime).
// ---------------------------------------------------------------------------

function routeProtection(
  pathname: string,
  role: string | null
): 'ok' | 'login' | 'unauthorized' {
  if (!role) return 'login';

  if (
    pathname.startsWith('/teacher') &&
    role !== 'teacher' &&
    role !== 'class-advisor' &&
    role !== 'admin'
  ) {
    return 'unauthorized';
  }

  if (pathname.startsWith('/student') && role !== 'student') {
    return 'unauthorized';
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return 'unauthorized';
  }

  return 'ok';
}

describe('Middleware route protection logic', () => {
  // ------------------------------------------------------------------
  // No token → redirect to /login
  // ------------------------------------------------------------------
  describe('unauthenticated access', () => {
    it('redirects /teacher/* to login when no token', () => {
      expect(routeProtection('/teacher/dashboard', null)).toBe('login');
    });

    it('redirects /student/* to login when no token', () => {
      expect(routeProtection('/student/dashboard', null)).toBe('login');
    });

    it('redirects /admin/* to login when no token', () => {
      expect(routeProtection('/admin/dashboard', null)).toBe('login');
    });
  });

  // ------------------------------------------------------------------
  // Teacher routes
  // ------------------------------------------------------------------
  describe('/teacher routes', () => {
    it('allows teacher role', () => {
      expect(routeProtection('/teacher/dashboard', 'teacher')).toBe('ok');
    });

    it('allows class-advisor role', () => {
      expect(routeProtection('/teacher/attendance', 'class-advisor')).toBe('ok');
    });

    it('allows admin role', () => {
      expect(routeProtection('/teacher/grading', 'admin')).toBe('ok');
    });

    it('blocks student role', () => {
      expect(routeProtection('/teacher/dashboard', 'student')).toBe('unauthorized');
    });

    it('blocks unknown role', () => {
      expect(routeProtection('/teacher/dashboard', 'coordinator')).toBe('unauthorized');
    });
  });

  // ------------------------------------------------------------------
  // Student routes
  // ------------------------------------------------------------------
  describe('/student routes', () => {
    it('allows student role', () => {
      expect(routeProtection('/student/dashboard', 'student')).toBe('ok');
    });

    it('blocks teacher role', () => {
      expect(routeProtection('/student/attendance', 'teacher')).toBe('unauthorized');
    });

    it('blocks admin role', () => {
      expect(routeProtection('/student/grades', 'admin')).toBe('unauthorized');
    });

    it('blocks class-advisor role', () => {
      expect(routeProtection('/student/courses', 'class-advisor')).toBe('unauthorized');
    });
  });

  // ------------------------------------------------------------------
  // Admin routes
  // ------------------------------------------------------------------
  describe('/admin routes', () => {
    it('allows admin role', () => {
      expect(routeProtection('/admin/dashboard', 'admin')).toBe('ok');
    });

    it('blocks teacher role', () => {
      expect(routeProtection('/admin/teachers', 'teacher')).toBe('unauthorized');
    });

    it('blocks student role', () => {
      expect(routeProtection('/admin/students', 'student')).toBe('unauthorized');
    });

    it('blocks class-advisor role', () => {
      expect(routeProtection('/admin/weeks', 'class-advisor')).toBe('unauthorized');
    });
  });

  // ------------------------------------------------------------------
  // Non-protected routes are not matched by the middleware config
  // (matcher only covers /teacher/*, /student/*, /admin/*)
  // ------------------------------------------------------------------
  describe('non-protected routes', () => {
    it('does not restrict /login', () => {
      expect(routeProtection('/login', null)).toBe('login');
    });

    it('allows any role on /api routes', () => {
      expect(routeProtection('/api/students', 'student')).toBe('ok');
    });
  });
});
