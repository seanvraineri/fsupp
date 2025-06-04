// Example script to invoke an edge function in local development.
// Copy to test-edge-function.js and set SUPABASE_SERVICE_KEY & SUPABASE_URL via env.

import fetch from 'node-fetch';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

async function testGenerateAnalysis(){
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate_analysis`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      Authorization:`Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ user_id:'test-user-123' })
  });
  console.log(await res.json());
}

testGenerateAnalysis(); 