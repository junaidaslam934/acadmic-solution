import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('API route called - processing upload...');
    
    const formData = await request.formData();
    
    // Log the files being uploaded
    const files = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push({ key, name: value.name, size: value.size });
      }
    }
    console.log('Files received:', files);
    
    // Forward the request to n8n webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch('https://n8n.algoace.agency/webhook-test/timetable-generate', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          // Don't set Content-Type, let the browser set it for FormData
        }
      });

      clearTimeout(timeoutId);

      console.log('n8n response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('n8n error response:', errorText);
        
        // Parse n8n error message if possible
        let errorMessage = `n8n webhook failed: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = `n8n Error: ${errorJson.message}`;
            if (errorJson.hint) {
              errorMessage += ` Hint: ${errorJson.hint}`;
            }
          }
        } catch {
          // If parsing fails, use the original error text
          errorMessage += ` - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Try to parse JSON response, fallback to text if it fails
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        result = await response.text();
        console.log('n8n returned text response:', result);
      }
      
      console.log('Upload successful, n8n response:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Files uploaded successfully to n8n webhook',
        data: result
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout - n8n webhook took too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed',
      error: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 500 });
  }
}