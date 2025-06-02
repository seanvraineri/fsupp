const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.3Rn1OQsqZGGqT9SfQ3C5avWEBLIrnJnNi8d8HzYtXiA';

async function testGenerateAnalysis() {
  try {
    const response = await fetch('https://tcptynohlpggtufqanqg.supabase.co/functions/v1/generate_analysis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: '236ad7cd-8b9a-497b-b623-7badd328ce46' })
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testGenerateAnalysis(); 