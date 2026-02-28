import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { advisors } = body;

    console.log('=== Sending Advisor Emails ===');
    console.log('Number of advisors:', advisors?.length);
    console.log('Advisors data:', advisors);

    if (!advisors || !Array.isArray(advisors) || advisors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No advisors data provided' },
        { status: 400 }
      );
    }

    // Forward to n8n webhook
    const n8nWebhookUrl = 'https://n8n.algoace.agency/webhook-test/advisor-emails';
    
    console.log('Forwarding to n8n:', n8nWebhookUrl);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ advisors }),
    });

    console.log('n8n response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n error:', errorText);
      
      // Return success anyway since advisors were saved
      return NextResponse.json({
        success: true,
        message: 'Advisors saved but email notification failed',
        n8nError: `n8n returned ${response.status}: ${errorText}`,
        advisorsSent: advisors.length
      });
    }

    const responseData = await response.text();
    console.log('n8n response:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Email notifications sent successfully',
      advisorsSent: advisors.length,
      n8nResponse: responseData
    });

  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email notifications' 
      },
      { status: 500 }
    );
  }
}
