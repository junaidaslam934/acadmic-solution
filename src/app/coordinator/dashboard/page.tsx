'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Assignment {
  _id: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  courseId: {
    _id: string;
    courseCode: string;
    courseName: string;
    year: number;
    semester: number;
    credits: number;
    department: string;
  };
  year: number;
  semester: number;
  isPreferred: boolean;
}

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [coordinatorName, setCoordinatorName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const coordinatorId = localStorage.getItem('coordinatorId');
    const name = localStorage.getItem('coordinatorName');
    
    if (!coordinatorId) {
      router.push('/login');
      return;
    }
    
    setCoordinatorName(name || 'Coordinator');
    fetchAllAssignments();
  }, []);

  const fetchAllAssignments = async () => {
    try {
      const res = await fetch('/api/course-assignments');
      const data = await res.json();
      
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('coordinatorId');
    localStorage.removeItem('coordinatorName');
    localStorage.removeItem('coordinatorEmail');
    router.push('/login');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadStatus(`Selected: ${file.name}`);
      } else {
        alert('Please select a PDF file only');
        event.target.value = '';
      }
    }
  };

  const handleUploadToN8N = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading PDF to n8n...');

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('data', selectedFile, selectedFile.name);
      
      // Use Next.js API route to avoid CORS issues
      const apiUrl = '/api/upload-to-n8n';
      
      console.log('=== Upload Details ===');
      console.log('File name:', selectedFile.name);
      console.log('File size:', selectedFile.size, 'bytes');
      console.log('File type:', selectedFile.type);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      });

      console.log('=== Response Details ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
        console.log('Response JSON:', responseData);
      } else {
        responseData = await response.text();
        console.log('Response Text:', responseData);
      }

      if (response.ok) {
        console.log('=== Full Response Data ===');
        console.log('responseData:', responseData);
        console.log('responseData type:', typeof responseData);
        console.log('responseData.n8nResponse:', responseData.n8nResponse);
        
        setUploadStatus('Processing complete! Checking for download...');
        
        // Try to extract n8n response data
        let n8nData = null;
        
        // Check if response contains n8nResponse
        if (responseData.n8nResponse) {
          console.log('n8nResponse exists, attempting to parse...');
          
          try {
            // Try to parse if it's a string
            if (typeof responseData.n8nResponse === 'string') {
              console.log('n8nResponse is string, parsing...');
              n8nData = JSON.parse(responseData.n8nResponse);
            } else {
              console.log('n8nResponse is already object');
              n8nData = responseData.n8nResponse;
            }
          } catch (parseError) {
            console.error('Error parsing n8nResponse:', parseError);
            n8nData = responseData.n8nResponse;
          }
        } else if (responseData.data) {
          // Check if data field exists
          n8nData = responseData.data;
        } else {
          // Use the entire response
          n8nData = responseData;
        }
        
        console.log('=== Parsed n8n Data ===');
        console.log('n8nData:', n8nData);
        
        if (n8nData && typeof n8nData === 'object') {
          console.log('n8nData keys:', Object.keys(n8nData));
          
          // Extract PDF URL from n8n response - try multiple possible field names
          const pdfUrl = n8nData.dataUrl || n8nData.URL || n8nData.url || n8nData.fileUrl || n8nData.pdfUrl || n8nData.downloadUrl;
          const fileName = n8nData.fileName || n8nData['File Name'] || n8nData.filename || n8nData.name || 'timetable-generated.pdf';
          
          console.log('=== Extracted Values ===');
          console.log('pdfUrl:', pdfUrl);
          console.log('fileName:', fileName);
          
          if (pdfUrl) {
            console.log('PDF URL found, downloading from:', pdfUrl);
            setUploadStatus('Downloading PDF...');
            
            try {
              // Download the PDF file
              const pdfResponse = await fetch(pdfUrl);
              console.log('PDF fetch response status:', pdfResponse.status);
              
              if (pdfResponse.ok) {
                const blob = await pdfResponse.blob();
                console.log('Blob created, size:', blob.size);
                
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
                
                setUploadStatus('Download complete!');
                alert(`Success!\n\nTimetable generated and downloaded: ${fileName}`);
              } else {
                throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
              }
            } catch (downloadError) {
              console.error('Error downloading PDF:', downloadError);
              setUploadStatus('Download failed');
              alert(`PDF URL received but download failed.\n\nURL: ${pdfUrl}\n\nError: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}\n\nTry opening the URL directly in your browser.`);
            }
          } else {
            console.warn('No PDF URL found in n8n response');
            setUploadStatus('No download URL found');
            alert(`File uploaded to n8n successfully!\n\nHowever, no download URL was found in the response.\n\nResponse data:\n${JSON.stringify(n8nData, null, 2)}`);
          }
        } else {
          console.warn('n8nData is not an object');
          setUploadStatus('Unexpected response format');
          alert(`File uploaded successfully!\n\nResponse: ${JSON.stringify(responseData, null, 2)}`);
        }
        
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(`Upload failed with status ${response.status} (${response.statusText}): ${JSON.stringify(responseData)}`);
      }
    } catch (error) {
      console.error('=== Upload Error ===');
      console.error('Error details:', error);
      if (error instanceof TypeError) {
        console.error('Network error - check if n8n URL is accessible');
      }
      setUploadStatus('Upload failed');
      alert(`Failed to upload PDF to n8n.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the browser console (F12) for detailed error information.`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const downloadAllYearsTextFile = () => {
    if (assignments.length === 0) {
      alert('No assignments found');
      return;
    }

    let textContent = '';
    
    // Header
    textContent += '═══════════════════════════════════════════════════════════════\n';
    textContent += '          COMPLETE COURSE ASSIGNMENTS REPORT\n';
    textContent += '                    All Years (1-4)\n';
    textContent += '═══════════════════════════════════════════════════════════════\n\n';
    
    textContent += `Generated by: ${coordinatorName}\n`;
    textContent += `Date: ${new Date().toLocaleString()}\n`;
    textContent += `Total Assignments: ${assignments.length}\n`;
    textContent += `Total Credits: ${assignments.reduce((sum, a) => sum + a.courseId.credits, 0)}\n`;
    textContent += `Total Teachers: ${new Set(assignments.map(a => a.teacherId._id)).size}\n`;
    textContent += `Total Courses: ${new Set(assignments.map(a => a.courseId._id)).size}\n\n`;
    
    // Timetable Slots
    textContent += '═══════════════════════════════════════════════════════════════\n';
    textContent += '                  WEEKLY TIMETABLE SLOTS\n';
    textContent += '═══════════════════════════════════════════════════════════════\n\n';
    
    const timetable = [
      { day: 'Monday', slots: [
        { start: '08:30', end: '09:20', slot: '1', duration: 50, type: 'Lecture' },
        { start: '09:20', end: '10:10', slot: '2', duration: 50, type: 'Lecture' },
        { start: '10:10', end: '11:00', slot: '3', duration: 50, type: 'Lecture' },
        { start: '11:00', end: '11:30', slot: 'BREAK', duration: 30, type: 'Break' },
        { start: '11:30', end: '12:20', slot: '4', duration: 50, type: 'Lecture' },
        { start: '12:20', end: '13:10', slot: '5', duration: 50, type: 'Lecture' },
        { start: '13:00', end: '14:30', slot: 'LUNCH', duration: 90, type: 'Lunch Break' },
        { start: '14:30', end: '15:20', slot: '6', duration: 50, type: 'Lecture' },
        { start: '15:20', end: '16:10', slot: '7', duration: 50, type: 'Lecture' }
      ]},
      { day: 'Tuesday', slots: [
        { start: '08:30', end: '09:20', slot: '1', duration: 50, type: 'Lecture' },
        { start: '09:20', end: '10:10', slot: '2', duration: 50, type: 'Lecture' },
        { start: '10:10', end: '11:00', slot: '3', duration: 50, type: 'Lecture' },
        { start: '11:00', end: '11:30', slot: 'BREAK', duration: 30, type: 'Break' },
        { start: '11:30', end: '12:20', slot: '4', duration: 50, type: 'Lecture' },
        { start: '12:20', end: '13:10', slot: '5', duration: 50, type: 'Lecture' },
        { start: '13:00', end: '14:30', slot: 'LUNCH', duration: 90, type: 'Lunch Break' },
        { start: '14:30', end: '15:20', slot: '6', duration: 50, type: 'Lecture' },
        { start: '15:20', end: '16:10', slot: '7', duration: 50, type: 'Lecture' }
      ]},
      { day: 'Wednesday', slots: [
        { start: '08:30', end: '09:20', slot: '1', duration: 50, type: 'Lecture' },
        { start: '09:20', end: '10:10', slot: '2', duration: 50, type: 'Lecture' },
        { start: '10:10', end: '11:00', slot: '3', duration: 50, type: 'Lecture' },
        { start: '11:00', end: '11:30', slot: 'BREAK', duration: 30, type: 'Break' },
        { start: '11:30', end: '12:20', slot: '4', duration: 50, type: 'Lecture' },
        { start: '12:20', end: '13:10', slot: '5', duration: 50, type: 'Lecture' },
        { start: '13:00', end: '14:30', slot: 'LUNCH', duration: 90, type: 'Lunch Break' },
        { start: '14:30', end: '15:20', slot: '6', duration: 50, type: 'Lecture' },
        { start: '15:20', end: '16:10', slot: '7', duration: 50, type: 'Lecture' }
      ]}
    ];
    
    timetable.forEach(day => {
      textContent += `\n${day.day}:\n`;
      textContent += '─'.repeat(65) + '\n';
      day.slots.forEach(slot => {
        textContent += `  ${slot.start} - ${slot.end}  |  Slot ${slot.slot.padEnd(5)}  |  ${slot.duration} min  |  ${slot.type}\n`;
      });
    });
    
    // Section Information
    textContent += '\n\n═══════════════════════════════════════════════════════════════\n';
    textContent += '              YEAR-WISE SECTION INFORMATION\n';
    textContent += '═══════════════════════════════════════════════════════════════\n\n';
    
    [1, 2, 3, 4].forEach(year => {
      textContent += `${year}st/nd/rd/th Year: 3 Sections (A, B, C) - ~30-35 students per section\n`;
    });
    
    // Course Assignments by Year
    [1, 2, 3, 4].forEach(year => {
      const yearAssignments = assignments.filter(a => a.year === year);
      
      if (yearAssignments.length > 0) {
        textContent += '\n\n═══════════════════════════════════════════════════════════════\n';
        textContent += `                 YEAR ${year} - COURSE ASSIGNMENTS\n`;
        textContent += '═══════════════════════════════════════════════════════════════\n\n';
        
        textContent += `Total Courses: ${yearAssignments.length}\n`;
        textContent += `Total Credits: ${yearAssignments.reduce((sum, a) => sum + a.courseId.credits, 0)}\n`;
        textContent += `Preferred Courses: ${yearAssignments.filter(a => a.isPreferred).length}\n\n`;
        
        textContent += '─'.repeat(100) + '\n';
        textContent += `${'Code'.padEnd(12)} | ${'Course Name'.padEnd(35)} | ${'Credits'.padEnd(8)} | ${'Sem'.padEnd(5)} | ${'Teacher'.padEnd(25)} | ${'Pref'}\n`;
        textContent += '─'.repeat(100) + '\n';
        
        yearAssignments.forEach(assignment => {
          const code = assignment.courseId.courseCode.padEnd(12);
          const name = assignment.courseId.courseName.substring(0, 35).padEnd(35);
          const credits = assignment.courseId.credits.toString().padEnd(8);
          const sem = assignment.semester.toString().padEnd(5);
          const teacher = assignment.teacherId.name.substring(0, 25).padEnd(25);
          const pref = assignment.isPreferred ? '✓' : '✗';
          
          textContent += `${code} | ${name} | ${credits} | ${sem} | ${teacher} | ${pref}\n`;
        });
        
        textContent += '─'.repeat(100) + '\n';
      }
    });
    
    textContent += '\n\n═══════════════════════════════════════════════════════════════\n';
    textContent += '                      END OF REPORT\n';
    textContent += '═══════════════════════════════════════════════════════════════\n';
    
    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `All-Years-Course-Assignments-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllYearsPDF = () => {
    if (assignments.length === 0) {
      alert('No assignments found');
      return;
    }

    const doc = new jsPDF();
    
    // Cover Page
    doc.setFontSize(22);
    doc.setTextColor(139, 92, 246);
    doc.text('Complete Course Assignments Report', 105, 40, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('All Years (1-4)', 105, 50, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text(`Generated by: ${coordinatorName}`, 105, 70, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 78, { align: 'center' });
    doc.text(`Total Assignments: ${assignments.length}`, 105, 86, { align: 'center' });
    doc.text(`Total Credits: ${assignments.reduce((sum, a) => sum + a.courseId.credits, 0)}`, 105, 94, { align: 'center' });
    
    // Add Timetable Slots Information
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246);
    doc.text('Weekly Timetable Slots', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Standard lecture schedule for all years', 14, 28);
    
    const timetableData = [
      ['Monday', '08:30', '09:20', '1', '50', 'Lecture'],
      ['Monday', '09:20', '10:10', '2', '50', 'Lecture'],
      ['Monday', '10:10', '11:00', '3', '50', 'Lecture'],
      ['Monday', '11:00', '11:30', 'BREAK', '30', 'Break'],
      ['Monday', '11:30', '12:20', '4', '50', 'Lecture'],
      ['Monday', '12:20', '13:10', '5', '50', 'Lecture'],
      ['Monday', '13:00', '14:30', 'LUNCH', '90', 'Lunch Break'],
      ['Monday', '14:30', '15:20', '6', '50', 'Lecture'],
      ['Monday', '15:20', '16:10', '7', '50', 'Lecture'],
      ['Tuesday', '08:30', '09:20', '1', '50', 'Lecture'],
      ['Tuesday', '09:20', '10:10', '2', '50', 'Lecture'],
      ['Tuesday', '10:10', '11:00', '3', '50', 'Lecture'],
      ['Tuesday', '11:00', '11:30', 'BREAK', '30', 'Break'],
      ['Tuesday', '11:30', '12:20', '4', '50', 'Lecture'],
      ['Tuesday', '12:20', '13:10', '5', '50', 'Lecture'],
      ['Tuesday', '13:00', '14:30', 'LUNCH', '90', 'Lunch Break'],
      ['Tuesday', '14:30', '15:20', '6', '50', 'Lecture'],
      ['Tuesday', '15:20', '16:10', '7', '50', 'Lecture'],
      ['Wednesday', '08:30', '09:20', '1', '50', 'Lecture'],
      ['Wednesday', '09:20', '10:10', '2', '50', 'Lecture'],
      ['Wednesday', '10:10', '11:00', '3', '50', 'Lecture'],
      ['Wednesday', '11:00', '11:30', 'BREAK', '30', 'Break'],
      ['Wednesday', '11:30', '12:20', '4', '50', 'Lecture'],
      ['Wednesday', '12:20', '13:10', '5', '50', 'Lecture'],
      ['Wednesday', '13:00', '14:30', 'LUNCH', '90', 'Lunch Break'],
      ['Wednesday', '14:30', '15:20', '6', '50', 'Lecture'],
      ['Wednesday', '15:20', '16:10', '7', '50', 'Lecture']
    ];
    
    autoTable(doc, {
      startY: 35,
      head: [['Day', 'Start Time', 'End Time', 'Slot', 'Duration (min)', 'Type']],
      body: timetableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 30 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 30 },
        5: { halign: 'left', cellWidth: 40 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.cell.raw === 'Break') {
          data.cell.styles.fillColor = [254, 243, 199];
        } else if (data.section === 'body' && data.cell.raw === 'Lunch Break') {
          data.cell.styles.fillColor = [254, 226, 226];
        }
      }
    });
    
    // Add Year Sections Information
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246);
    doc.text('Year-wise Section Information', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Section distribution across academic years', 14, 28);
    
    const sectionData = [
      ['1st Year', '3', 'A, B, C', '~30-35 per section'],
      ['2nd Year', '3', 'A, B, C', '~30-35 per section'],
      ['3rd Year', '3', 'A, B, C', '~30-35 per section'],
      ['4th Year', '3', 'A, B, C', '~30-35 per section']
    ];
    
    autoTable(doc, {
      startY: 35,
      head: [['Year', 'Total Sections', 'Section Names', 'Avg Students']],
      body: sectionData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 40 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 50 },
        3: { halign: 'center', cellWidth: 50 }
      }
    });
    
    // Generate tables for each year
    [1, 2, 3, 4].forEach((year, index) => {
      const yearAssignments = assignments.filter(a => a.year === year);
      
      if (yearAssignments.length > 0) {
        // Add new page for each year (except first)
        if (index > 0) {
          doc.addPage();
        } else {
          doc.addPage();
        }
        
        // Year title
        doc.setFontSize(16);
        doc.setTextColor(139, 92, 246);
        doc.text(`Year ${year} - Course Assignments`, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Courses: ${yearAssignments.length} | Credits: ${yearAssignments.reduce((sum, a) => sum + a.courseId.credits, 0)}`, 14, 28);
        
        // Prepare table data
        const tableData = yearAssignments.map(assignment => [
          assignment.courseId.courseCode,
          assignment.courseId.courseName,
          assignment.courseId.credits.toString(),
          `Sem ${assignment.semester}`,
          assignment.teacherId.name,
          assignment.courseId.department,
          assignment.isPreferred ? 'Yes' : 'No'
        ]);
        
        // Generate table
        autoTable(doc, {
          startY: 35,
          head: [['Code', 'Course Name', 'Credits', 'Sem', 'Teacher', 'Department', 'Pref']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [139, 92, 246],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 20 },
            1: { halign: 'left', cellWidth: 50 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'left', cellWidth: 35 },
            5: { halign: 'center', cellWidth: 25 },
            6: { halign: 'center', cellWidth: 15 }
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 6) {
              const rowIndex = data.row.index;
              if (yearAssignments[rowIndex]?.isPreferred) {
                data.cell.styles.fillColor = [220, 252, 231];
                data.cell.styles.textColor = [22, 163, 74];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });
      }
    });
    
    // Add page numbers to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `All-Years-Course-Assignments-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const downloadYearPDF = (year: number) => {
    const yearAssignments = assignments.filter(a => a.year === year);
    
    if (yearAssignments.length === 0) {
      alert(`No assignments found for Year ${year}`);
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(139, 92, 246); // Purple color
    doc.text(`Year ${year} Course Assignments`, 14, 20);
    
    // Metadata
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated by: ${coordinatorName}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Total Courses: ${yearAssignments.length}`, 14, 42);
    doc.text(`Total Credits: ${yearAssignments.reduce((sum, a) => sum + a.courseId.credits, 0)}`, 14, 48);
    
    // Prepare table data
    const tableData = yearAssignments.map(assignment => [
      assignment.courseId.courseCode,
      assignment.courseId.courseName,
      assignment.courseId.credits.toString(),
      `Semester ${assignment.semester}`,
      assignment.teacherId.name,
      assignment.courseId.department,
      assignment.isPreferred ? 'Yes' : 'No'
    ]);
    
    // Generate table
    autoTable(doc, {
      startY: 55,
      head: [['Course Code', 'Course Name', 'Credits', 'Semester', 'Teacher', 'Department', 'Preferred']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246], // Purple
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 22 },
        1: { halign: 'left', cellWidth: 45 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'left', cellWidth: 35 },
        5: { halign: 'center', cellWidth: 25 },
        6: { halign: 'center', cellWidth: 18 }
      },
      didParseCell: (data) => {
        // Highlight preferred courses
        if (data.section === 'body' && data.column.index === 6) {
          const rowIndex = data.row.index;
          if (yearAssignments[rowIndex]?.isPreferred) {
            data.cell.styles.fillColor = [220, 252, 231]; // Light green
            data.cell.styles.textColor = [22, 163, 74]; // Green text
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `Year-${year}-Course-Assignments-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const getYearStats = (year: number) => {
    const yearAssignments = assignments.filter(a => a.year === year);
    return {
      total: yearAssignments.length,
      credits: yearAssignments.reduce((sum, a) => sum + a.courseId.credits, 0),
      preferred: yearAssignments.filter(a => a.isPreferred).length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">Coordinator Portal</h1>
              <p className="text-sm text-gray-600">Course Assignment Reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {coordinatorName}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload to n8n Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-2">Upload PDF to n8n Workflow</h3>
              <p className="text-blue-100 text-sm">Select a PDF file containing course assignments to upload to n8n for timetable generation</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* File Input */}
              <div className="flex-1">
                <label 
                  htmlFor="pdf-upload" 
                  className="flex items-center justify-center px-6 py-4 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-blue-300"
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-indigo-600 font-semibold">
                      {selectedFile ? selectedFile.name : 'Click to select PDF file'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Only PDF files accepted</p>
                  </div>
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUploadToN8N}
                disabled={uploading || !selectedFile}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center space-x-3 whitespace-nowrap ${
                  uploading || !selectedFile
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-white text-indigo-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload to n8n</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Message */}
            {uploadStatus && (
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <p className="text-white text-sm font-medium">{uploadStatus}</p>
              </div>
            )}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{assignments.length}</p>
              </div>
              <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Set(assignments.map(a => a.teacherId._id)).size}
                </p>
              </div>
              <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Set(assignments.map(a => a.courseId._id)).size}
                </p>
              </div>
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {assignments.reduce((sum, a) => sum + a.courseId.credits, 0)}
                </p>
              </div>
              <svg className="h-10 w-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
          </div>
        </div>

        {/* Year-wise PDF Downloads */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Download Course Assignment Reports</h2>
              <p className="text-sm text-gray-600 mt-1">Generate PDF or Text reports for all academic years</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadAllYearsTextFile}
                disabled={assignments.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  assignments.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg'
                }`}
              >
                <span>📄</span>
                <span>Download Text File</span>
              </button>
              <button
                onClick={downloadAllYearsPDF}
                disabled={assignments.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  assignments.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                }`}
              >
                <span>📥</span>
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((year) => {
                const stats = getYearStats(year);
                return (
                  <div key={year} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <svg className="mx-auto h-12 w-12 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-xl font-bold text-gray-900">Year {year}</h3>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Courses:</span>
                        <span className="font-semibold">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credits:</span>
                        <span className="font-semibold">{stats.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preferred:</span>
                        <span className="font-semibold text-green-600">{stats.preferred}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadYearPDF(year)}
                      disabled={stats.total === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        stats.total === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {stats.total === 0 ? 'No Data' : 'Download PDF'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
