import { NextRequest, NextResponse } from 'next/server';

// Mock user database - replace with your actual database
const mockUsers = [
  { email: 'admin@university.edu', role: 'admin' },
  { email: 'student@university.edu', role: 'student' },
  { email: 'staff@university.edu', role: 'staff' },
];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user exists (replace with your database query)
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, you will receive a password reset link shortly.'
      });
    }

    // Generate reset token (in production, use crypto.randomBytes or similar)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // In production, save this token to database with expiration time
    console.log(`Reset token for ${email}: ${resetToken}`);
    
    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send email (replace with your email service)
    const emailSent = await sendResetEmail(email, resetLink, user.role);
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Password reset link has been sent to your email address.'
      });
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process request. Please try again later.'
    }, { status: 500 });
  }
}

// Mock email sending function - replace with your email service
async function sendResetEmail(email: string, resetLink: string, role: string): Promise<boolean> {
  try {
    // This is where you'd integrate with your email service
    // Examples: SendGrid, Nodemailer, AWS SES, etc.
    
    console.log('=== PASSWORD RESET EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('Subject: Reset Your Academic Solutions Password');
    console.log(`
Email Content:
--------------
Hello,

You requested a password reset for your Academic Solutions account (${role}).

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
Academic Solutions Team
    `);
    console.log('============================');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, replace this with actual email sending logic:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: 'noreply@academicsolutions.com',
      subject: 'Reset Your Academic Solutions Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your Academic Solutions account (${role}).</p>
        <p><a href="${resetLink}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>Academic Solutions Team</p>
      `
    };
    
    await sgMail.send(msg);
    */
    
    return true; // Return true for demo purposes
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}