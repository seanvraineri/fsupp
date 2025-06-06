import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

serve(async (req: Request) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response('Missing env vars', { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Test basic query
    const { data: files, error } = await supabase
      .from('uploaded_files')
      .select('id, file_name, file_type')
      .limit(5);
    
    return new Response(JSON.stringify({
      success: !error,
      error: error?.message,
      count: files?.length || 0,
      files: files || []
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: String(err)
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 