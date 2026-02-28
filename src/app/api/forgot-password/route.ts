import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { apiSuccess, apiError } from '@/lib/api-response';
import { forgotPasswordSchema, validateBody } from '@/lib/validations';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = validateBody(forgotPasswordSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    await connectDB();

    // Check if admin exists with this email
    const admin = await Admin.findOne({ email: data!.email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!admin) {
      return apiSuccess({
        message: 'If this email is registered, you will receive a password reset link shortly.',
      });
    }

    // Generate cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    admin.resetToken = resetToken;
    admin.resetTokenExpiry = resetTokenExpiry;
    await admin.save();

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(data!.email)}`;

    // TODO: Integrate with email service (SendGrid, Nodemailer, etc.)
    // For now, log it server-side only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset link generated (dev only):', resetLink);
    }

    return apiSuccess({
      message: 'If this email is registered, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return apiError('Failed to process request. Please try again later.', { status: 500 });
  }
}