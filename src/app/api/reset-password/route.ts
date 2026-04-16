import { NextRequest, NextResponse } from 'next/server';

// Mock token storage - in production, use a database
const mockTokens: { [key: string]: { email: string, expires: number } } = {};

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate token (in production, check against database)
    const tokenData = mockTokens[token];
    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired (1 hour expiry)
    if (Date.now() > tokenData.expires) {
      delete mockTokens[token]; // Clean up expired token
      return NextResponse.json(
        { success: false, message: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify email matches
    if (tokenData.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // In production, update password in database
    console.log(`Password reset successful for: ${email}`);
    console.log(`New password: ${password}`);
    
    // Here you would:
    // 1. Hash the password
    // 2. Update user's password in database
    // 3. Invalidate all existing sessions for this user
    // 4. Send confirmation email
    
    /*
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });
    */

    // Clean up used token
    delete mockTokens[token];

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    }, { status: 500 });
  }
}

// Helper function to store tokens (for demo purposes)
export function storeResetToken(token: string, email: string) {
  mockTokens[token] = {
    email,
    expires: Date.now() + (60 * 60 * 1000) // 1 hour from now
  };
}