// deno-lint-ignore-file
// @ts-nocheck

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

export interface UserContext {
  profile: any;
  labs: any[];
  genes: any[];
  comprehensiveLabs: any[]; // New: full biomarker data
  comprehensiveGenes: any[]; // New: full SNP data
}

export async function fetchUserContext(sb:SupabaseClient, userId:string):Promise<UserContext>{
  // Get profile (handle missing table gracefully)
  let profile = null;
  try {
    let { data, error } = await sb.from('profiles').select().eq('id', userId).single();
    if(error && error.code === '42P01'){ // table does not exist
      const alt = await sb.from('user_profiles').select().eq('id', userId).single();
      profile = alt.data;
    } else {
      profile = data;
    }
  } catch (err) {
    console.warn('Profile lookup failed, continuing without profile:', err);
    profile = { id: userId, summary: 'No profile data available' };
  }
  
  // COMPREHENSIVE LAB DATA (like ai_chat) ================================
  const { data: labData } = await sb
    .from("lab_biomarkers")
    .select("vitamin_d, vitamin_b12, iron, ferritin, magnesium, cholesterol_total, hdl, ldl, triglycerides, glucose, hba1c, tsh, biomarker_data, test_date, lab_name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  const comprehensiveLabs = [];
  let labs = []; // Legacy format for backward compatibility
  
  if (labData && labData.length > 0) {
    for (const lab of labData) {
      // Store comprehensive data
      if (lab.biomarker_data && Object.keys(lab.biomarker_data).length > 0) {
        comprehensiveLabs.push({
          biomarker_data: lab.biomarker_data,
          biomarker_count: Object.keys(lab.biomarker_data).length,
          test_date: lab.test_date,
          lab_name: lab.lab_name,
          created_at: lab.created_at
        });
        
        // Convert to legacy format for backward compatibility
        for (const [name, value] of Object.entries(lab.biomarker_data)) {
          labs.push({
            name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: typeof value === 'number' ? value : parseFloat(value) || null,
            unit: "", // We don't store units separately
            collected_at: lab.test_date || lab.created_at
          });
        }
      }
    }
  }

  // COMPREHENSIVE GENETIC DATA (like ai_chat) ============================
  const { data: geneticData } = await sb
    .from("genetic_markers")
    .select("mthfr_c677t, mthfr_a1298c, apoe_variant, vdr_variants, comt_variants, snp_data, source_company, chip_version, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  const comprehensiveGenes = [];
  let genes = []; // Legacy format for backward compatibility
  
  if (geneticData && geneticData.length > 0) {
    for (const genetic of geneticData) {
      // Store comprehensive data
      if (genetic.snp_data && Object.keys(genetic.snp_data).length > 0) {
        comprehensiveGenes.push({
          snp_data: genetic.snp_data,
          snp_count: Object.keys(genetic.snp_data).length,
          mthfr_c677t: genetic.mthfr_c677t,
          mthfr_a1298c: genetic.mthfr_a1298c,
          apoe_variant: genetic.apoe_variant,
          vdr_variants: genetic.vdr_variants,
          comt_variants: genetic.comt_variants,
          source_company: genetic.source_company,
          created_at: genetic.created_at
        });
        
        // Convert to legacy format for backward compatibility  
        for (const [rsid, genotype] of Object.entries(genetic.snp_data)) {
          // Map known SNPs to gene names
          let geneName = "Unknown";
          let effect = genotype;
          
          if (rsid === "rs1801133") { geneName = "MTHFR"; effect = `C677T ${genotype}`; }
          else if (rsid === "rs1801131") { geneName = "MTHFR"; effect = `A1298C ${genotype}`; }
          else if (rsid === "rs429358" || rsid === "rs7412") { geneName = "APOE"; effect = `${rsid} ${genotype}`; }
          else if (rsid === "rs4680") { geneName = "COMT"; effect = `Val158Met ${genotype}`; }
          else if (rsid === "rs1544410" || rsid === "rs2228570") { geneName = "VDR"; effect = `${rsid} ${genotype}`; }
          
          genes.push({
            gene: geneName,
            snp: rsid,
            effect: effect,
            allele: genotype
          });
        }
      }
    }
  }

  return { 
    profile, 
    labs: labs ?? [], 
    genes: genes ?? [],
    comprehensiveLabs: comprehensiveLabs ?? [],
    comprehensiveGenes: comprehensiveGenes ?? []
  };
} 
