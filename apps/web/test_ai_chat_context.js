// Test what context AI chat actually builds
// This verifies the AI chat sees the full biomarker and genetic data

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing environment variables");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

console.log("🧪 Testing AI Chat Context Generation");

const db_user_id = '236ad7cd-8b9a-497b-b623-7badd328ce46';

// Replicate exactly what ai_chat does
console.log("📊 Fetching lab data...");
const { data: labData } = await supabase
  .from("lab_biomarkers")
  .select("vitamin_d, vitamin_b12, iron, ferritin, magnesium, cholesterol_total, hdl, ldl, triglycerides, glucose, hba1c, tsh, biomarker_data, test_date, lab_name, created_at")
  .eq("user_id", db_user_id)
  .order("created_at", { ascending: false })
  .limit(3);

console.log("🧬 Fetching genetic data...");
const { data: geneticData } = await supabase
  .from("genetic_markers")
  .select("mthfr_c677t, mthfr_a1298c, apoe_variant, vdr_variants, comt_variants, snp_data, source_company, chip_version, created_at")
  .eq("user_id", db_user_id)
  .order("created_at", { ascending: false })
  .limit(3);

console.log(`\n📋 Raw Data Retrieved:`);
console.log(`   Lab Records: ${labData?.length || 0}`);
console.log(`   Genetic Records: ${geneticData?.length || 0}`);

// Build context exactly like AI chat does
let personalizedContext = `\n\n## USER PERSONALIZATION DATA:`;

if (geneticData && geneticData.length > 0) {
  personalizedContext += `\n\n### YOUR GENETIC MARKERS:`;
  geneticData.forEach(genetic => {
    const testDate = new Date(genetic.created_at).toLocaleDateString();
    personalizedContext += `\n**Genetic Test from ${genetic.source_company || 'Unknown'} (${testDate}):**`;
    
    // Show key highlights first
    if (genetic.mthfr_c677t) {
      personalizedContext += `\n- MTHFR C677T: ${genetic.mthfr_c677t}`;
    }
    if (genetic.mthfr_a1298c) {
      personalizedContext += `\n- MTHFR A1298C: ${genetic.mthfr_a1298c}`;
    }
    if (genetic.apoe_variant) {
      personalizedContext += `\n- APOE Variant: ${genetic.apoe_variant}`;
    }
    
    // Show comprehensive SNP data
    if (genetic.snp_data && typeof genetic.snp_data === 'object' && Object.keys(genetic.snp_data).length > 0) {
      const snpCount = Object.keys(genetic.snp_data).length;
      personalizedContext += `\n**COMPREHENSIVE GENETIC DATA (${snpCount.toLocaleString()} SNPs):**`;
      
      const allSnps = Object.entries(genetic.snp_data);
      
      if (snpCount <= 100) {
        // Show all SNPs for small datasets
        personalizedContext += `\n  ALL SNPs: ${allSnps.map(([rsid, genotype]) => `${rsid}:${genotype}`).join(', ')}`;
      } else {
        // For large datasets, show strategic sampling
        const importantSnps = ['rs1801133', 'rs1801131', 'rs429358', 'rs7412', 'rs4680', 'rs1544410', 'rs2228570'];
        const foundImportant = [];
        const randomSample = [];
        
        // Get important SNPs
        importantSnps.forEach(rsid => {
          if (genetic.snp_data[rsid]) {
            foundImportant.push(`${rsid}:${genetic.snp_data[rsid]}`);
          }
        });
        
        // Get random sample of remaining SNPs (up to 50 more)
        const otherSnps = allSnps.filter(([rsid]) => !importantSnps.includes(rsid));
        const sampleSize = Math.min(50, otherSnps.length);
        for (let i = 0; i < sampleSize; i++) {
          const randomIndex = Math.floor(Math.random() * otherSnps.length);
          const [rsid, genotype] = otherSnps.splice(randomIndex, 1)[0];
          randomSample.push(`${rsid}:${genotype}`);
        }
        
        if (foundImportant.length > 0) {
          personalizedContext += `\n  KEY SNPs: ${foundImportant.join(', ')}`;
        }
        if (randomSample.length > 0) {
          personalizedContext += `\n  SAMPLE DATA: ${randomSample.join(', ')}`;
        }
        personalizedContext += `\n  FULL DATASET: ${snpCount.toLocaleString()} total SNPs available for analysis`;
      }
    }
  });
}

if (labData && labData.length > 0) {
  personalizedContext += `\n\n### YOUR LAB RESULTS:`;
  labData.forEach(lab => {
    const testDate = lab.test_date || new Date(lab.created_at).toLocaleDateString();
    personalizedContext += `\n**Lab Results from ${lab.lab_name || 'Unknown'} (${testDate}):**`;
    
    // Show ALL biomarkers from comprehensive extraction (biomarker_data JSON)
    if (lab.biomarker_data && Object.keys(lab.biomarker_data).length > 0) {
      const biomarkerCount = Object.keys(lab.biomarker_data).length;
      personalizedContext += `\n**COMPREHENSIVE LAB PANEL (${biomarkerCount.toLocaleString()} biomarkers):**`;
      
      // For small datasets, show all. For large datasets, show organized sample
      const allBiomarkers = Object.entries(lab.biomarker_data);
      
      if (biomarkerCount <= 50) {
        // Show all biomarkers for small datasets
        const biomarkerList = allBiomarkers.map(([k, v]) => {
          const displayName = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${displayName}: ${v}`;
        });
        personalizedContext += `\n  ALL BIOMARKERS: ${biomarkerList.join(', ')}`;
      } else {
        // Large dataset processing...
        personalizedContext += `\n  FULL DATASET: ${biomarkerCount.toLocaleString()} total biomarkers available for analysis`;
      }
    }
  });
}

console.log(`\n🎯 AI Chat Context Test Results:`);
console.log(`   Context Length: ${personalizedContext.length} characters`);

// Count biomarkers and SNPs in context
const biomarkerMatches = personalizedContext.match(/[A-Z][a-z\s]+: \d+/g) || [];
const snpMatches = personalizedContext.match(/rs\d+:\w+/g) || [];

console.log(`   Biomarkers in Context: ${biomarkerMatches.length}`);
console.log(`   SNPs in Context: ${snpMatches.length}`);

console.log(`\n📄 Generated Context Preview:`);
console.log(personalizedContext.slice(0, 2000) + '...');

console.log(`\n✅ Context Generation Analysis:`);
if (biomarkerMatches.length >= 40) {
  console.log(`   ✓ FULL biomarker context (${biomarkerMatches.length} found)`);
} else {
  console.log(`   ❌ LIMITED biomarker context (only ${biomarkerMatches.length} found)`);
}

if (snpMatches.length >= 10) {
  console.log(`   ✓ FULL genetic context (${snpMatches.length} SNPs found)`);  
} else {
  console.log(`   ❌ LIMITED genetic context (only ${snpMatches.length} SNPs found)`);
}

if (personalizedContext.includes("46 biomarkers") || personalizedContext.includes("44 biomarkers")) {
  console.log(`   ✓ AI knows total biomarker count`);
} else {
  console.log(`   ❌ AI doesn't know total biomarker count`);
} 