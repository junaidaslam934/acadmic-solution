import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(_request: NextRequest) {
  try {
    console.log('PDF upload API GET request called');

    // Return list of uploaded PDFs or webhook status
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'pdfs');
    
    let files: string[] = [];
    if (existsSync(uploadsDir)) {
      files = await readdir(uploadsDir);
    }

    return NextResponse.json({
      success: true,
      message: 'PDF upload webhook is active',
      uploadedFiles: files,
      totalFiles: files.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('PDF GET error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Request failed',
        error: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('PDF upload API route called');

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const timestamp = formData.get('timestamp') as string;
    const adminId = formData.get('admin_id') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    console.log('Received PDF file:', file.name, file.size, 'bytes');

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'pdfs');
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename with timestamp
    const timestamp_ms = Date.now();
    const filename = `${timestamp_ms}_${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log('PDF saved to:', filepath);

    // Prepare data to send to n8n webhook
    const webhookData = {
      fileName: file.name,
      fileSize: file.size,
      savedName: filename,
      uploadedAt: timestamp,
      uploadedBy: adminId,
      fileUrl: `/uploads/pdfs/${filename}`,
      timestamp: new Date().toISOString(),
      mimeType: file.type
    };

    // Send data to n8n webhook asynchronously (non-blocking)
    // This runs in the background without blocking the response
    (async () => {
      try {
        const webhookUrl = 'https://junniauto.app.n8n.cloud/webhook-test/pdf-timetable';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!webhookResponse.ok) {
          console.warn('n8n webhook request failed:', webhookResponse.status, webhookResponse.statusText);
        } else {
          console.log('n8n webhook called successfully');
        }
      } catch (webhookError) {
        console.error('Error calling n8n webhook:', webhookError);
        // Don't fail the upload if webhook fails
      }
    })();

    // Return success response with file info
    return NextResponse.json({
      success: true,
      message: 'PDF uploaded successfully',
      file: {
        name: file.name,
        size: file.size,
        savedName: filename,
        uploadedAt: timestamp,
        uploadedBy: adminId,
        url: `/uploads/pdfs/${filename}`
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
        error: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
