// Test script using service role key to call function directly
const fs = require('fs');

async function testWithServiceKey() {
  const supabaseUrl = "https://tcptynohlpggtufqanqg.supabase.co";
  
  // Read service role key from .env file
  const envFile = fs.readFileSync('./.env', 'utf8');
  const serviceRoleKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];
  
  if (!serviceRoleKey) {
    console.error("Could not find SUPABASE_SERVICE_ROLE_KEY in .env file");
    return;
  }
  
  const testContent = fs.readFileSync('./test_genetic_file.txt', 'utf8');
  
  console.log("Testing with service role key...");
  console.log("File content preview:", testContent.slice(0, 200));
  
  const response = await fetch(`${supabaseUrl}/functions/v1/parse_upload_fast`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: 'test-direct-' + Date.now(),
      user_id: '236ad7cd-8b9a-497b-b623-7badd328ce46', // real user ID from DB
      filename: 'test_genetic_file.txt',
      content: testContent
    }),
  });

  console.log("\n=== DIRECT FUNCTION RESULTS ===");
  console.log("Response status:", response.status);
  console.log("Content-Type:", response.headers.get('content-type'));
  
  const responseText = await response.text();
  console.log("Raw response:", responseText.slice(0, 500));
  
  // Try to parse as JSON
  try {
    const result = JSON.parse(responseText);
    console.log("Parsed result:", JSON.stringify(result, null, 2));
  } catch (e) {
    console.log("Response is not JSON, full text:");
    console.log(responseText);
  }
}

testWithServiceKey().catch(console.error); 