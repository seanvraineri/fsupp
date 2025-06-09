// Test script to call our fast processing function
async function testProcessing() {
  const supabaseUrl = "https://tcptynohlpggtufqanqg.supabase.co";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MjU0MzMsImV4cCI6MjA1MzQwMTQzM30.3PJGrWP1kW7TJWl2S3QfHGhvhC4oS9mjjzVjJpJrP0I";
  
  // Read test file  
  const fs = require('fs');
  const testContent = fs.readFileSync('./test_genetic_file.txt', 'utf8');
  
  console.log("Testing fast processing pipeline...");
  console.log("File content preview:", testContent.slice(0, 200));
  
  const response = await fetch(`${supabaseUrl}/functions/v1/parse_upload_fast`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: 'test-123',
      user_id: '550e8400-e29b-41d4-a716-446655440000', // test UUID
      filename: 'test_genetic_file.txt',
      content: testContent
    }),
  });

  const result = await response.json();
  console.log("\n=== PROCESSING RESULTS ===");
  console.log("Response status:", response.status);
  console.log("Result:", JSON.stringify(result, null, 2));
}

testProcessing().catch(console.error); 