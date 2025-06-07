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

    let body: { path?: string; file_id?: string; bucket?: string; file_type?: 'genetic' | 'lab_results' };
    try {
      body = await req.json();
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
    
    const { path, file_id, bucket = 'uploads', file_type } = body;
    
    // Support both path and file_id parameters
    if (!path && !file_id) {
      return new Response('Missing path or file_id parameter', { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Get file row - either by path or by file_id
    let fileRow: any;
    let storagePath: string;
    
    if (file_id) {
      // Look up by file_id
      const { data: fileData, error: frErr } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', file_id)
        .single();
      
      if (frErr || !fileData) {
        return new Response('File not found by file_id', { status: 404 });
      }
      
      fileRow = fileData;
      storagePath = fileRow.storage_path;
    } else {
      // Look up by path (legacy behavior)
      const { data: fileData, error: frErr } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('storage_path', path)
        .single();
      
      if (frErr || !fileData) {
        return new Response('File not found by path', { status: 404 });
      }
      
      fileRow = fileData;
      storagePath = path!;
    }
    
    // Determine file_type if not provided
    const determinedFileType = file_type || fileRow.file_type;
    if (!determinedFileType) {
      return new Response('Unable to determine file_type', { status: 400 });
    }

    // Mark as processing
    await supabase
      .from('uploaded_files')
      .update({ 
        processing_status: 'processing', 
        processing_started_at: new Date().toISOString() 
      })
      .eq('id', fileRow.id);

    const { data: download, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(storagePath);
    
    if (dlErr || !download) {
      await supabase.from('uploaded_files').update({ 
        processing_status: 'failed', 
        processing_error: `Download failed: ${dlErr?.message || 'Unknown error'}`,
        processing_completed_at: new Date().toISOString()
      }).eq('id', fileRow.id);
      return new Response('Download failed', { status: 500 });
    }

    const arrayBuf = await download.arrayBuffer();
    
    // Detect file type and extract text content
    const detected = await detectFileType(arrayBuf, fileRow.file_name);
    
    let result: ProcessResult;
    
    if (determinedFileType === 'genetic') {
      result = await processGeneticFile(detected.textContent, supabase, fileRow, detected.format, arrayBuf);
    } else {
      result = await processLabFile(detected.format, arrayBuf, detected.textContent, supabase, fileRow);
    }
    
    // 🔄  Send content to embedding_worker for vector memory
    try {
      const items = [{
        user_id: fileRow.user_id,
        source_type: determinedFileType === 'genetic' ? 'gene' : 'lab',
        source_id: fileRow.id,
        content: detected.textContent.slice(0, 15000) // avoid huge payloads
      }];
      await supabase.functions.invoke('embedding_worker', { body: { items } });
    } catch (embedErr) {
      console.error('embedding_worker error', embedErr);
    }
    
    await supabase.from('uploaded_files').update({ 
      processing_status: 'completed',
      processing_completed_at: new Date().toISOString()
    }).eq('id', fileRow.id);
    
    // Update file_type if we inferred it
    await supabase.from('uploaded_files').update({ file_type: determinedFileType }).eq('id', fileRow.id);
    
    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error in parse_upload:', err);
    
    // Try to update the file status if we have the identifier
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const body = await req.json();
      const { path, file_id } = body;
      
      if (file_id) {
        await supabase.from('uploaded_files').update({ 
          processing_status: 'failed', 
          processing_error: String(err),
          processing_completed_at: new Date().toISOString()
        }).eq('id', file_id);
      } else if (path) {
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
