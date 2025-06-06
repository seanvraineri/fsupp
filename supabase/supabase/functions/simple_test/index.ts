import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

serve(async (req: Request) => {
  try {
    // Use hardcoded values for testing
    const SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co";
    const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.DZzvM9eC_4sDcTjndvdPEKVPJgJBg8-rB9M9Ax_DzCI";

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Test specific file lookup
    const { data: specificFile, error: specificError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', 'e3c50c9f-ed3c-4eb4-99a1-8357859d6b3a')
      .single();
    
    return new Response(JSON.stringify({
      success: !specificError,
      specificFile: specificFile,
      specificError: specificError?.message
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