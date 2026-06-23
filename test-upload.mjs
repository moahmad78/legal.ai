import fs from 'fs';
import path from 'path';

async function testUpload() {
  const files = [
    { name: 'test.pdf', type: 'application/pdf', content: 'dummy pdf content' },
    { name: 'test.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', content: 'dummy docx content' },
    { name: 'test.jpg', type: 'image/jpeg', content: 'dummy image content' },
  ];

  for (const file of files) {
    console.log(`\nTesting upload for ${file.name}...`);
    
    // Create dummy file
    fs.writeFileSync(file.name, file.content);

    // Create form data manually to send to localhost:3000
    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(file.name)], { type: file.type });
    formData.append('file', blob, file.name);
    formData.append('guest_session_id', 'test-session-123');

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      console.log(`Response for ${file.name}:`, data);
      
      if (!response.ok || !data.success) {
        console.error(`Failed to upload ${file.name}:`, data);
      } else {
        console.log(`Successfully uploaded ${file.name}`);
      }
    } catch (e) {
      console.error(`Error uploading ${file.name}:`, e);
    }
    
    // Clean up
    fs.unlinkSync(file.name);
  }
}

testUpload();
