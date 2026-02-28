import { NextRequest } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  return apiSuccess(
    { message: 'Logged out successfully' },
    {
      headers: { 'Set-Cookie': clearAuthCookie() },
    }
  );
}
