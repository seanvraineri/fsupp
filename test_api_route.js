// Test the API route that calls the fast processing function
async function testAPIRoute() {
  const fs = require('fs');
  const testContent = fs.readFileSync('./test_genetic_file.txt', 'utf8');
  
  console.log("Testing API route (requires authentication)...");
  console.log("File content preview:", testContent.slice(0, 200));
  
  // Create fake auth cookies (this won't work without real auth)
  // For testing, we should test the edge function directly
  const response = await fetch('http://localhost:3000/api/supabase/functions/parse_upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: 'test-123',
      user_id: '550e8400-e29b-41d4-a716-446655440000', 
      filename: 'test_genetic_file.txt',
      content: testContent
    }),
  });

  const result = await response.json();
  console.log("\n=== API ROUTE RESULTS ===");
  console.log("Response status:", response.status);
  console.log("Result:", JSON.stringify(result, null, 2));
}

testAPIRoute().catch(console.error); 