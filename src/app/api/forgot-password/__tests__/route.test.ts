import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '../route';

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/forgot-password', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/email is required/i);
  });

  it('returns 400 for an invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/valid email/i);
  });

  it('returns success message for an unknown email (no enumeration)', async () => {
    const res = await POST(makeRequest({ email: 'unknown@example.com' }));
    const json = await res.json();

    // Security: must not reveal whether email exists
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/if this email is registered/i);
  });

  it('returns success and sends reset link for a known email', async () => {
    // admin@university.edu is in the mock users list
    const res = await POST(makeRequest({ email: 'admin@university.edu' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('is case-insensitive for known email lookup', async () => {
    const res = await POST(makeRequest({ email: 'ADMIN@UNIVERSITY.EDU' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
