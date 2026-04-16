import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const { mockFind, mockSave, mockFindByIdAndDelete } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockSave: vi.fn(),
  mockFindByIdAndDelete: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/models/Teacher', () => {
  const MockTeacher = vi.fn().mockImplementation(function(data: any) {
    return { ...data, _id: 'new-teacher-id', save: mockSave };
  });
  (MockTeacher as any).find = mockFind;
  (MockTeacher as any).findByIdAndDelete = mockFindByIdAndDelete;
  return { default: MockTeacher };
});

import { GET, POST, DELETE } from '../route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(
  method: string,
  body?: object,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost/api/teachers');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url.toString(), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /api/teachers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all teachers', async () => {
    const teachers = [{ name: 'Dr. Smith', employeeId: 'T001' }];
    mockFind.mockReturnValueOnce({ sort: vi.fn().mockResolvedValueOnce(teachers) });

    const res = await GET(makeRequest('GET'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.teachers).toEqual(teachers);
  });

  it('filters by activeOnly=true', async () => {
    mockFind.mockReturnValueOnce({ sort: vi.fn().mockResolvedValueOnce([]) });

    await GET(makeRequest('GET', undefined, { activeOnly: 'true' }));

    expect(mockFind).toHaveBeenCalledWith({ isActive: true });
  });

  it('returns all teachers without activeOnly filter', async () => {
    mockFind.mockReturnValueOnce({ sort: vi.fn().mockResolvedValueOnce([]) });

    await GET(makeRequest('GET'));

    expect(mockFind).toHaveBeenCalledWith({});
  });

  it('returns 500 on database error', async () => {
    mockFind.mockReturnValueOnce({
      sort: vi.fn().mockRejectedValueOnce(new Error('DB error')),
    });

    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/teachers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a teacher and returns 201', async () => {
    mockSave.mockResolvedValueOnce(undefined);

    const res = await POST(
      makeRequest('POST', { name: 'Dr. Smith', email: 'smith@ned.edu.pk', employeeId: 'T001' })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/added successfully/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest('POST', { name: 'Dr. Smith' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 400 on duplicate employeeId', async () => {
    mockSave.mockRejectedValueOnce({ code: 11000, keyPattern: { employeeId: 1 } });

    const res = await POST(
      makeRequest('POST', { name: 'Dr. Smith', email: 'smith@ned.edu.pk', employeeId: 'T001' })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/employeeId already exists/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockSave.mockRejectedValueOnce(new Error('Unexpected'));

    const res = await POST(
      makeRequest('POST', { name: 'Dr. Smith', email: 'smith@ned.edu.pk', employeeId: 'T001' })
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });
});

describe('DELETE /api/teachers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes a teacher and returns 200', async () => {
    mockFindByIdAndDelete.mockResolvedValueOnce({ _id: 'teacher-id' });

    const res = await DELETE(makeRequest('DELETE', undefined, { id: 'teacher-id' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it('returns 400 when id is not provided', async () => {
    const res = await DELETE(makeRequest('DELETE'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 500 on database error', async () => {
    mockFindByIdAndDelete.mockRejectedValueOnce(new Error('DB fail'));

    const res = await DELETE(makeRequest('DELETE', undefined, { id: 'teacher-id' }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
