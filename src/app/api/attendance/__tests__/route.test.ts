import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const {
  mockAttendanceFind,
  mockAttendanceFindOne,
  mockAttendanceFindByIdAndUpdate,
  mockAttendanceSave,
  mockTeacherFindById,
} = vi.hoisted(() => ({
  mockAttendanceFind: vi.fn(),
  mockAttendanceFindOne: vi.fn(),
  mockAttendanceFindByIdAndUpdate: vi.fn(),
  mockAttendanceSave: vi.fn(),
  mockTeacherFindById: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock mongoose for connection.db usage inside the route
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mongoose')>();
  return {
    ...actual,
    connection: {
      db: {
        collection: vi.fn().mockReturnValue({
          findOne: vi.fn().mockResolvedValue({ credits: 3 }),
        }),
      },
    },
    Types: actual.Types,
  };
});

vi.mock('@/models/Attendance', () => {
  const MockAttendance = vi.fn().mockImplementation(function(data: any) {
    return { ...data, save: mockAttendanceSave };
  });
  (MockAttendance as any).find = mockAttendanceFind;
  (MockAttendance as any).findOne = mockAttendanceFindOne;
  (MockAttendance as any).findByIdAndUpdate = mockAttendanceFindByIdAndUpdate;
  return { default: MockAttendance };
});

vi.mock('@/models/Teacher', () => ({
  default: { findById: (...args: any[]) => mockTeacherFindById(...args) },
}));

import { GET, POST, PUT } from '../route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(
  method: string,
  body?: object,
  searchParams?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost/api/attendance');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url.toString(), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

const sampleRecords = [{ studentId: 's1', studentName: 'Alice', rollNumber: 'CS-001', isAbsent: false }];
const validPostBody = {
  teacherId: 'teacher-id',
  courseId: 'course-id',
  courseName: 'OOP',
  year: 1,
  section: 'A',
  attendanceRecords: sampleRecords,
  weekNumber: 1,
  sessionNumber: 1,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /api/attendance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when teacherId is missing', async () => {
    const res = await GET(makeRequest('GET'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/teacher id required/i);
  });

  it('returns attendance records on success', async () => {
    const records = [{ _id: 'r1', teacherId: 'teacher-id' }];
    mockAttendanceFind.mockReturnValueOnce({
      sort: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(records) }),
    });

    const res = await GET(makeRequest('GET', undefined, { teacherId: 'teacher-id' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.attendance).toEqual(records);
  });

  it('returns 500 on database error', async () => {
    mockAttendanceFind.mockReturnValueOnce({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValueOnce(new Error('DB error')),
      }),
    });

    const res = await GET(makeRequest('GET', undefined, { teacherId: 'teacher-id' }));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/attendance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest('POST', { teacherId: 't1' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 404 when teacher is not found', async () => {
    mockTeacherFindById.mockResolvedValueOnce(null);

    const res = await POST(makeRequest('POST', validPostBody));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toMatch(/teacher not found/i);
  });

  it('creates new attendance record when none exists', async () => {
    mockTeacherFindById.mockResolvedValueOnce({ _id: 'teacher-id' });
    mockAttendanceFindOne.mockResolvedValueOnce(null);
    mockAttendanceSave.mockResolvedValueOnce(undefined);

    const res = await POST(makeRequest('POST', validPostBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/new attendance record created/i);
  });

  it('updates existing attendance record when one exists', async () => {
    const existing = {
      attendanceRecords: [],
      date: new Date(),
      save: vi.fn().mockResolvedValueOnce(undefined),
    };
    mockTeacherFindById.mockResolvedValueOnce({ _id: 'teacher-id' });
    mockAttendanceFindOne.mockResolvedValueOnce(existing);

    const res = await POST(makeRequest('POST', validPostBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.message).toMatch(/attendance updated/i);
  });

  it('returns 400 when sessionNumber exceeds course credits', async () => {
    mockTeacherFindById.mockResolvedValueOnce({ _id: 'teacher-id' });
    // course has 1 credit, session 3 exceeds it
    const mongoose = await import('mongoose');
    (mongoose.connection.db!.collection('allcourses').findOne as any) = vi
      .fn()
      .mockResolvedValueOnce({ credits: 1 });

    const res = await POST(
      makeRequest('POST', { ...validPostBody, sessionNumber: 3 })
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/exceeds maximum/i);
  });
});

describe('PUT /api/attendance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when required fields are missing', async () => {
    const res = await PUT(makeRequest('PUT', {}));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 404 when attendance record is not found', async () => {
    mockAttendanceFindByIdAndUpdate.mockResolvedValueOnce(null);

    const res = await PUT(
      makeRequest('PUT', { attendanceId: 'bad-id', attendanceRecords: sampleRecords })
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
  });

  it('updates and returns the attendance record', async () => {
    const updated = { _id: 'att-id', attendanceRecords: sampleRecords };
    mockAttendanceFindByIdAndUpdate.mockResolvedValueOnce(updated);

    const res = await PUT(
      makeRequest('PUT', { attendanceId: 'att-id', attendanceRecords: sampleRecords })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.attendance).toEqual(updated);
  });
});
