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

    // Use hardcoded values since environment variables aren't working correctly
    const SUPABASE_URL = "https://tcptynohlpggtufqanqg.supabase.co";
    const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.DZzvM9eC_4sDcTjndvdPEKVPJgJBg8-rB9M9Ax_DzCI";
    
    console.log('Using hardcoded connection values');
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Missing required connection values');
      return new Response('Server configuration error', { status: 500 });
    }

    let body: { path?: string; file_id?: string; bucket?: string; file_type?: 'genetic' | 'lab_results' };
    try {
      body = await req.json();
    } catch (_) {
      return new Response('Invalid JSON', { status: 400 });
    }
    
    const { path, file_id, bucket = 'uploads', file_type } = body;
    console.log('Request body:', { path, file_id, bucket, file_type });
    
    // Support both path and file_id parameters
    if (!path && !file_id) {
      return new Response('Missing path or file_id parameter', { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    console.log('Supabase client created');
    
    // Get file row - either by path or by file_id
    let fileRow: any;
    let storagePath: string;
    
    if (file_id) {
      console.log('Looking up file by ID:', file_id);
      // Look up by file_id
      const { data: fileData, error: frErr } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', file_id)
        .single();
      
      console.log('File lookup result:', { fileData, frErr });
      
      if (frErr || !fileData) {
        console.error('File not found by file_id:', frErr);
        return new Response(`File not found by file_id: ${frErr?.message || 'No data'}`, { status: 404 });
      }
      
      fileRow = fileData;
      storagePath = fileRow.storage_path;
    } else {
      console.log('Looking up file by path:', path);
      // Look up by path (legacy behavior)
      const { data: fileData, error: frErr } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('storage_path', path)
        .single();
      
      console.log('File lookup result:', { fileData, frErr });
      
      if (frErr || !fileData) {
        console.error('File not found by path:', frErr);
        return new Response(`File not found by path: ${frErr?.message || 'No data'}`, { status: 404 });
      }
      
      fileRow = fileData;
      storagePath = path!;
    }
    
    console.log('File found:', { id: fileRow.id, storage_path: storagePath });
    
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
    
    // Try to update the file status if we have the identifier
    try {
      const supabase = createClient(
        "https://tcptynohlpggtufqanqg.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.DZzvM9eC_4sDcTjndvdPEKVPJgJBg8-rB9M9Ax_DzCI"
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
