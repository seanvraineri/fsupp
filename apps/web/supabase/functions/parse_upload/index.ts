// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import OpenAI from "npm:openai@4.18.0";
import { detectFileType } from "./lib/detectFileType.ts";
import { processGeneticFile } from "./lib/genetic.ts";
import { processLabFile } from "./lib/lab.ts";

export interface ProcessResult {
  status: "ok" | "error";
  file_id: string;
  [key: string]: any;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validate environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables', { 
        SUPABASE_URL: !!SUPABASE_URL, 
        SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY 
      });
      return new Response('Server configuration error', { status: 500 });
    }

    let body: { path: string; bucket?: string; file_type: 'genetic' | 'lab_results' };
    try {
      body = await req.json();
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
    const { path, bucket = 'uploads', file_type } = body;
    if (!path || !file_type) return new Response('Missing path or file_type', { status: 400 });

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Mark as processing
    await supabase
      .from('uploaded_files')
      .update({ processing_status: 'processing', processing_started_at: new Date().toISOString() })
      .eq('storage_path', path);

    const { data: fileRow, error: frErr } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('storage_path', path)
      .single();
    if (frErr || !fileRow) return new Response('upload row not found', { status: 404 });

    const { data: download, error: dlErr } = await supabase.storage.from(bucket).download(path);
    if (dlErr || !download) return new Response('download failed', { status: 500 });

    const arrayBuf = await download.arrayBuffer();
    
    // Detect file type and extract text content
    const detected = await detectFileType(arrayBuf, fileRow.file_name);
    
    let result: ProcessResult;
    
    if (file_type === 'genetic') {
      result = await processGeneticFile(detected.textContent, supabase, fileRow, detected.format, arrayBuf);
    } else {
      result = await processLabFile(detected.format, arrayBuf, detected.textContent, supabase, fileRow);
    }
    
    await supabase.from('uploaded_files').update({ 
      processing_status: 'completed',
      processing_completed_at: new Date().toISOString()
    }).eq('id', fileRow.id);
    
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error in parse_upload:', err);
    
    // Try to update the file status if we have the path
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { path } = await req.json();
      if (path) {
        await supabase.from('uploaded_files').update({ 
          processing_status: 'failed', 
          processing_error: String(err),
          processing_completed_at: new Date().toISOString()
        }).eq('storage_path', path);
      }
    } catch (updateErr) {
      console.error('Failed to update file status:', updateErr);
    }
    
    return new Response('Processing failed', { status: 500 });
  }
}); 
