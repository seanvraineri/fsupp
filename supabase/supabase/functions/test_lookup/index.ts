import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co";
    const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.DZzvM9eC_4sDcTjndvdPEKVPJgJBg8-rB9M9Ax_DzCI";

    let body: { file_id?: string };
    try {
      body = await req.json();
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
    
    const { file_id } = body;
    if (!file_id) {
      return new Response('Missing file_id parameter', { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    console.log('Looking up file by ID:', file_id);
    
    const { data: fileData, error: frErr } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', file_id)
      .single();
    
    console.log('File lookup result:', { fileData, frErr });
    
    return new Response(JSON.stringify({
      success: !frErr,
      fileData: fileData,
      error: frErr?.message,
      file_id: file_id
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in test_lookup:', err);
    return new Response(JSON.stringify({
      success: false,
      error: String(err)
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 