import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mock DB and Student model before importing the route.
// vi.hoisted() ensures these variables are available when vi.mock factories run.
// ---------------------------------------------------------------------------
const { mockFind, mockSave, mockFindByIdAndDelete } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockSave: vi.fn(),
  mockFindByIdAndDelete: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/models/Student', () => {
  const MockStudent = vi.fn().mockImplementation(function(data: any) {
    return { ...data, _id: 'new-id', save: mockSave };
  });
  (MockStudent as any).find = mockFind;
  (MockStudent as any).findByIdAndDelete = mockFindByIdAndDelete;
  return { default: MockStudent };
});

// ---------------------------------------------------------------------------
// Import route handlers AFTER mocks are registered
// ---------------------------------------------------------------------------
import { GET, POST, DELETE } from '../route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(
  method: string,
  body?: object,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost/api/students');
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
describe('GET /api/students', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all students on success', async () => {
    const students = [{ studentName: 'Alice', rollNumber: '001' }];
    mockFind.mockResolvedValueOnce(students);

    const res = await GET(makeRequest('GET'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.students).toEqual(students);
  });

  it('returns 500 on database error', async () => {
    mockFind.mockRejectedValueOnce(new Error('DB failure'));

    const res = await GET(makeRequest('GET'));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });
});

describe('POST /api/students', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a student and returns 201 on valid input', async () => {
    mockSave.mockResolvedValueOnce(undefined);

    const res = await POST(
      makeRequest('POST', {
        studentName: 'Bob',
        rollNumber: 'CS-001',
        year: 1,
        section: 'A',
      })
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/added successfully/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(
      makeRequest('POST', { studentName: 'Bob' }) // missing rollNumber, year, section
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 400 when rollNumber already exists (duplicate key error)', async () => {
    mockSave.mockRejectedValueOnce({ code: 11000 });

    const res = await POST(
      makeRequest('POST', {
        studentName: 'Bob',
        rollNumber: 'CS-001',
        year: 1,
        section: 'A',
      })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/roll number already exists/i);
  });

  it('returns 500 on unexpected error', async () => {
    mockSave.mockRejectedValueOnce(new Error('Unexpected'));

    const res = await POST(
      makeRequest('POST', {
        studentName: 'Bob',
        rollNumber: 'CS-001',
        year: 1,
        section: 'A',
      })
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });
});

describe('DELETE /api/students', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes a student and returns 200', async () => {
    mockFindByIdAndDelete.mockResolvedValueOnce({ _id: 'some-id' });

    const res = await DELETE(makeRequest('DELETE', undefined, { id: 'some-id' }));
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

    const res = await DELETE(makeRequest('DELETE', undefined, { id: 'some-id' }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
