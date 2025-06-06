// Complete test: Upload file to storage, create DB record, then process
const fs = require('fs');

async function testCompleteFlow() {
  const supabaseUrl = "https://tcptynohlpggtufqanqg.supabase.co";
  
  // Read service role key from .env file
  const envFile = fs.readFileSync('./.env', 'utf8');
  const serviceRoleKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];
  
  if (!serviceRoleKey) {
    console.error("Could not find SUPABASE_SERVICE_ROLE_KEY in .env file");
    return;
  }
  
  const testContent = fs.readFileSync('./test_genetic_file.txt', 'utf8');
  const fileName = 'test_genetic_file.txt';
  const storagePath = `test/${Date.now()}_${fileName}`;
  
  console.log("=== COMPLETE FLOW TEST ===");
  console.log("1. Uploading file to storage...");
  
  // 1. Upload file to Supabase storage
  const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/uploads/${storagePath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'text/plain',
    },
    body: testContent
  });
  
  if (!uploadResponse.ok) {
    console.error("Upload failed:", await uploadResponse.text());
    return;
  }
  
  console.log("✓ File uploaded to storage");
  
  // 2. Create database record
  console.log("2. Creating database record...");
  const dbResponse = await fetch(`${supabaseUrl}/rest/v1/uploaded_files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: '236ad7cd-8b9a-497b-b623-7badd328ce46',
      file_type: 'genetic',
      file_name: fileName,
      file_size: testContent.length,
      mime_type: 'text/plain',
      storage_path: storagePath,
      processing_status: 'pending'
    })
  });
  
  if (!dbResponse.ok) {
    console.error("DB insert failed:", await dbResponse.text());
    return;
  }
  
  const fileRecord = await dbResponse.json();
  const fileId = fileRecord[0].id;
  console.log("✓ Database record created, file_id:", fileId);
  
  // 3. Process the file
  console.log("3. Processing file...");
  const processResponse = await fetch(`${supabaseUrl}/functions/v1/parse_upload_fast`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: fileId
    }),
  });

  console.log("=== PROCESSING RESULTS ===");
  console.log("Response status:", processResponse.status);
  console.log("Content-Type:", processResponse.headers.get('content-type'));
  
  const responseText = await processResponse.text();
  console.log("Raw response length:", responseText.length);
  
  // Try to parse as JSON
  try {
    const result = JSON.parse(responseText);
    console.log("✓ Parsed result:");
    console.log("  Status:", result.status);
    console.log("  File ID:", result.file_id);
    console.log("  SNP Count:", result.snp_count);
    console.log("  Processing Mode:", result.processing_mode);
    console.log("  Highlights:", JSON.stringify(result.highlights, null, 2));
    if (result.debug_data) {
      console.log("  Debug Data:");
      console.log("    SNP Data:", JSON.stringify(result.debug_data.snp_data, null, 2));
      console.log("    Source Company:", result.debug_data.source_company);
    }
  } catch (e) {
    console.log("Response is not JSON, full text:");
    console.log(responseText);
  }
  
  // 4. Check what was saved to database
  console.log("\n4. Checking database results...");
  const geneticResponse = await fetch(`${supabaseUrl}/rest/v1/genetic_markers?file_id=eq.${fileId}`, {
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (geneticResponse.ok) {
    const geneticData = await geneticResponse.json();
    console.log("✓ Genetic markers saved:", JSON.stringify(geneticData, null, 2));
  } else {
    console.log("No genetic data found or error:", await geneticResponse.text());
  }
}

testCompleteFlow().catch(console.error); 