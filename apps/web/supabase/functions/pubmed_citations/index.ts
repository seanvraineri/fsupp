// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";
import OpenAI from "npm:openai@4.18.0";

interface CitationBody {
  recommendation_id: string;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    
    // Validate environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const PUBMED_API_KEY = Deno.env.get('PUBMED_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response('Server configuration error', { status: 500 });
    }
    
    let body: CitationBody; 
    try { body = await req.json(); } catch (_) { return new Response('Invalid JSON', { status: 400 }); }
    const { recommendation_id } = body; 
    if (!recommendation_id) return new Response('Missing id', { status: 400 });

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: rec } = await supabase.from('supplement_recommendations').select('id, supplement_name, user_id').eq('id', recommendation_id).single();
    if (!rec) return new Response('Recommendation not found', { status: 404 });

    const { data: assessment } = await supabase.from('health_assessments').select('health_conditions, health_goals, allergies').eq('user_id', rec.user_id).eq('is_complete', true).order('created_at',{ascending:false}).limit(1).maybeSingle();
    const kws:string[]=[]; 
    if (assessment?.health_conditions?.length) kws.push(...assessment.health_conditions.slice(0,2)); 
    if (assessment?.health_goals?.length) kws.push(assessment.health_goals[0]);

    if (!PUBMED_API_KEY) {
      console.error('PUBMED_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'PubMed API key not configured', inserted: [] }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200  // Return 200 so it doesn't block the flow
      });
    }
    
    const term = encodeURIComponent(`${rec.supplement_name} supplementation ${kws.join(' ')}`);
    const esearch = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=3&sort=relevance&term=${term}&api_key=${PUBMED_API_KEY}`;
    let ids:string[]=[]; 
    try { 
      const j=await (await fetch(esearch)).json(); 
      ids=j.esearchresult?.idlist??[] 
    } catch { 
      console.error('PubMed search failed');
      return new Response(JSON.stringify({ error: 'PubMed search failed', inserted: [] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const openai = OPENAI_API_KEY ? new OpenAI({apiKey: OPENAI_API_KEY}) : null;
    const inserted:any[]=[];
    
    for (const pmid of ids) {
      let title=''; 
      try { 
        const js=await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json&api_key=${PUBMED_API_KEY}`)).json(); 
        title=js.result?.[pmid]?.title??'' 
      } catch {}
      
      let abstract=''; 
      try { 
        abstract=await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text&api_key=${PUBMED_API_KEY}`)).text() 
      } catch {}
      
      let summary=''; 
      if (openai && abstract) {
        try { 
          const comp=await openai.chat.completions.create({ 
            model:'gpt-3.5-turbo-0125', 
            messages:[{role:'user',content:`Patient profile: ${JSON.stringify(assessment)}\\n\\nArticle: ${abstract}\\n\\nIn 2 sentences explain relevance.`}], 
            max_tokens:120
          }); 
          summary=comp.choices?.[0]?.message?.content?.trim()??'' 
        } catch {}
      }
      
      const { data: row } = await supabase.from('recommendation_citations').insert({ 
        recommendation_id, 
        pmid, 
        title, 
        summary 
      }, { onConflict:'recommendation_id,pmid' }).select().maybeSingle(); 
      
      if (row) inserted.push(row);
    }
    
    return new Response(JSON.stringify({ inserted }),{ headers:{'Content-Type':'application/json'} });
  } catch (err) {
    console.error('Error in pubmed_citations:', err);
    return new Response('Internal server error', { status: 500 });
  }
}); 