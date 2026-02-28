import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('data') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Received file:', file.name, file.size, 'bytes');

    // Forward to n8n webhook
    const n8nWebhookUrl = 'https://n8n.algoace.agency/webhook-test/timetable-generate';
    
    // Create new FormData for n8n
    const n8nFormData = new FormData();
    n8nFormData.append('data', file, file.name);

    console.log('Forwarding to n8n:', n8nWebhookUrl);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: n8nFormData,
    });

    console.log('n8n response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n error:', errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `n8n returned ${response.status}: ${errorText}` 
        },
        { status: response.status }
      );
    }

    const responseData = await response.text();
    console.log('n8n response:', responseData);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      n8nResponse: responseData
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}
