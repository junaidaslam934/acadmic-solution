import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { apiSuccess, apiError } from '@/lib/api-response';
import { resetPasswordSchema, validateBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = validateBody(resetPasswordSchema, body);

    if (error) {
      return apiError(error, { status: 400 });
    }

    await connectDB();

    // Find admin with valid reset token
    const admin = await Admin.findOne({
      email: data!.email.toLowerCase(),
      resetToken: data!.token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!admin) {
      return apiError('Invalid or expired reset token. Please request a new one.', { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(data!.password, 12);

    // Update password and clear reset token
    admin.passwordHash = passwordHash;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();

    return apiSuccess({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return apiError('Failed to reset password. Please try again.', { status: 500 });
  }
}