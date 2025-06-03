// deno-lint-ignore-file
// @ts-nocheck

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

export interface UserContext {
  profile: any;
  labs: any[];
  genes: any[];
}

export async function fetchUserContext(sb:SupabaseClient, userId:string):Promise<UserContext>{
  // Phase-1: minimal implementation – just returns profile row.
  let { data:profile, error } = await sb.from('profiles').select().eq('id', userId).single();
  if(error && error.code === '42P01'){ // table does not exist
    const alt = await sb.from('user_profiles').select().eq('id', userId).single();
    profile = alt.data;
  }
  if(!profile) throw error ?? new Error('profile not found');
  let { data:labs } = await sb.from('lab_results').select().eq('user_id', userId).order('collected_at',{ascending:false}).limit(50);
  if (!labs?.length) {
    // fallback – lab_biomarkers holds biomarker_data (array of objects)
    const { data:labRows } = await sb.from('lab_biomarkers').select('biomarker_data,test_date').eq('user_id', userId).order('created_at',{ascending:false}).limit(1);
    if (labRows?.length) {
      const arr = labRows[0].biomarker_data as any[];
      labs = arr.map((b:any)=>({
        name: b.name??b.biomarker??"",
        value: b.value??b.result??null,
        unit: b.unit??b.units??"",
        collected_at: labRows[0].test_date
      }));
    }
  }

  let { data:genes } = await sb.from('gene_variants').select().eq('user_id', userId);
  if (!genes?.length) {
    const { data:geneRows } = await sb.from('genetic_markers').select('snp_data').eq('user_id', userId).order('created_at',{ascending:false}).limit(1);
    if (geneRows?.length) {
      genes = (geneRows[0].snp_data as any[]).map((s:any)=>({
        gene: s.gene??"",
        snp: s.snp??s.rsid??"",
        effect: s.effect??s.impact??"",
        allele: s.allele??s.genotype??""
      }));
    }
  }

  return { profile, labs: labs ?? [], genes: genes ?? [] };
} 