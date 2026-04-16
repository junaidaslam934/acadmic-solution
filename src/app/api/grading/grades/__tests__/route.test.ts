import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const {
  mockAssessmentFindOne,
  mockAssessmentFindById,
  mockStudentFind,
  mockGradeFind,
  mockGradeFindOne,
  mockGradeSave,
} = vi.hoisted(() => ({
  mockAssessmentFindOne: vi.fn(),
  mockAssessmentFindById: vi.fn(),
  mockStudentFind: vi.fn(),
  mockGradeFind: vi.fn(),
  mockGradeFindOne: vi.fn(),
  mockGradeSave: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Assessment mock
vi.mock('@/models/Assessment', () => ({
  default: {
    findOne: (...args: any[]) => mockAssessmentFindOne(...args),
    findById: (...args: any[]) => mockAssessmentFindById(...args),
  },
}));

// Student mock
vi.mock('@/models/Student', () => ({
  default: {
    find: (...args: any[]) => mockStudentFind(...args),
  },
}));

// Grade mock
vi.mock('@/models/Grade', () => {
  const MockGrade = vi.fn().mockImplementation(function(data: any) {
    return { ...data, auditTrail: data.auditTrail ?? [], save: mockGradeSave };
  });
  (MockGrade as any).find = mockGradeFind;
  (MockGrade as any).findOne = mockGradeFindOne;
  return { default: MockGrade };
});

import { GET, POST } from '../route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(method: string, body?: object, searchParams?: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/grading/grades');
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url.toString(), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

const mockAssessment = {
  _id: 'assessment-id',
  name: 'Quiz 1',
  type: 'quiz',
  totalMarks: 20,
  teacherId: 'teacher-id',
  courseId: { year: 2 },
  isActive: true,
};

const mockStudents = [
  { _id: 'student-1', studentName: 'Alice', rollNumber: 'CS-001', section: 'A' },
  { _id: 'student-2', studentName: 'Bob', rollNumber: 'CS-002', section: 'A' },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /api/grading/grades', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when assessmentId or teacherId is missing', async () => {
    const res = await GET(makeRequest('GET', undefined, { teacherId: 'teacher-id' }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('returns 404 when assessment is not found', async () => {
    mockAssessmentFindOne.mockReturnValueOnce({ populate: vi.fn().mockResolvedValueOnce(null) });

    const res = await GET(
      makeRequest('GET', undefined, { assessmentId: 'bad-id', teacherId: 'teacher-id' })
    );
    const json = await res.json();
    expect(res.status).toBe(404);
  });

  it('returns graded student list on success', async () => {
    mockAssessmentFindOne.mockReturnValueOnce({
      populate: vi.fn().mockResolvedValueOnce(mockAssessment),
    });
    mockStudentFind.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(mockStudents) }),
      }),
    });
    mockGradeFind.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([
        { studentId: 'student-1', marksObtained: 18, percentage: 90 },
      ]),
    });

    const res = await GET(
      makeRequest('GET', undefined, { assessmentId: 'assessment-id', teacherId: 'teacher-id' })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.grades).toHaveLength(2);
    // Alice should be graded
    expect(json.grades[0].isGraded).toBe(true);
    // Bob should not be graded
    expect(json.grades[1].isGraded).toBe(false);
  });
});

describe('POST /api/grading/grades', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when grades array is empty or missing', async () => {
    const res = await POST(makeRequest('POST', { grades: [] }));
    const json = await res.json();
    expect(res.status).toBe(400);
  });

  it('returns 400 when grades is not an array', async () => {
    const res = await POST(makeRequest('POST', { grades: 'invalid' }));
    const json = await res.json();
    expect(res.status).toBe(400);
  });

  it('creates new grade and reports success', async () => {
    mockAssessmentFindById.mockResolvedValueOnce(mockAssessment);
    mockGradeFindOne.mockResolvedValueOnce(null);
    mockGradeSave.mockResolvedValueOnce(undefined);

    const res = await POST(
      makeRequest('POST', {
        grades: [{ assessmentId: 'assessment-id', studentId: 'student-1', marksObtained: 15 }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.results).toHaveLength(1);
    expect(json.results[0].action).toBe('created');
  });

  it('updates existing grade and records in audit trail', async () => {
    mockAssessmentFindById.mockResolvedValueOnce(mockAssessment);

    const existingGrade = {
      marksObtained: 10,
      totalMarks: 20,
      auditTrail: [],
      save: vi.fn().mockResolvedValueOnce(undefined),
    };
    mockGradeFindOne.mockResolvedValueOnce(existingGrade);

    const res = await POST(
      makeRequest('POST', {
        grades: [{ assessmentId: 'assessment-id', studentId: 'student-1', marksObtained: 18 }],
      })
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.results[0].action).toBe('updated');
    expect(existingGrade.auditTrail).toHaveLength(1);
    expect(existingGrade.auditTrail[0].action).toBe('updated');
  });

  it('records error when assessment is not found', async () => {
    mockAssessmentFindById.mockResolvedValueOnce(null);

    const res = await POST(
      makeRequest('POST', {
        grades: [{ assessmentId: 'bad-id', studentId: 'student-1', marksObtained: 5 }],
      })
    );
    const json = await res.json();

    expect(json.errors).toHaveLength(1);
    expect(json.errors[0].error).toMatch(/assessment not found/i);
  });

  it('rejects marks that exceed totalMarks', async () => {
    mockAssessmentFindById.mockResolvedValueOnce(mockAssessment); // totalMarks = 20

    const res = await POST(
      makeRequest('POST', {
        grades: [{ assessmentId: 'assessment-id', studentId: 'student-1', marksObtained: 25 }],
      })
    );
    const json = await res.json();

    expect(json.errors).toHaveLength(1);
    expect(json.errors[0].error).toMatch(/marks must be between/i);
  });

  it('rejects negative marks', async () => {
    mockAssessmentFindById.mockResolvedValueOnce(mockAssessment);

    const res = await POST(
      makeRequest('POST', {
        grades: [{ assessmentId: 'assessment-id', studentId: 'student-1', marksObtained: -1 }],
      })
    );
    const json = await res.json();

    expect(json.errors).toHaveLength(1);
  });

  it('records error when required grade fields are missing', async () => {
    const res = await POST(
      makeRequest('POST', {
        grades: [{ assessmentId: 'assessment-id' }], // missing studentId and marksObtained
      })
    );
    const json = await res.json();

    expect(json.errors).toHaveLength(1);
    expect(json.errors[0].error).toMatch(/missing required fields/i);
  });
});
