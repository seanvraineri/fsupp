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
  const { data:profile, error } = await sb.from('profiles').select().eq('id', userId).single();
  if(error) throw error;
  const { data:labs } = await sb.from('lab_results').select().eq('user_id', userId).order('collected_at',{ascending:false}).limit(50);
  const { data:genes } = await sb.from('gene_variants').select().eq('user_id', userId);
  return { profile, labs: labs ?? [], genes: genes ?? [] };
} 