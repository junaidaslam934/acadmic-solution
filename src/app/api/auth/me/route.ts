import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const user = verifyAuth(request);

  if (!user) {
    return apiError('Not authenticated', { status: 401 });
  }

  return apiSuccess({
    user: {
      userId: user.userId,
      role: user.role,
      name: user.name,
      email: user.email,
    },
  });
}
