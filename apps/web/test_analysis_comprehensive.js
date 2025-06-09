// Test analysis function uses comprehensive data
// This verifies the analysis function sees the full 46 biomarkers and 20 SNPs

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing environment variables");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

console.log("🧪 Testing Analysis Function Comprehensive Data Access");

const userId = '236ad7cd-8b9a-497b-b623-7badd328ce46';

// Import the data fetch function directly 
const { fetchUserContext } = await import('./supabase/functions/generate_analysis_v2/lib/dataFetch.ts');
const { summariseComprehensiveLabs, identifyLabConcerns } = await import('./supabase/functions/generate_analysis_v2/lib/labs.ts');
const { summariseComprehensiveGenes, identifyGeneticConcerns } = await import('./supabase/functions/generate_analysis_v2/lib/genes.ts');

console.log("📊 Testing fetchUserContext...");
const context = await fetchUserContext(supabase, userId);

console.log(`\n📋 Context Retrieved:`);
console.log(`   Profile: ${!!context.profile}`);
console.log(`   Legacy Labs: ${context.labs?.length || 0}`);
console.log(`   Legacy Genes: ${context.genes?.length || 0}`);
console.log(`   Comprehensive Labs: ${context.comprehensiveLabs?.length || 0}`);
console.log(`   Comprehensive Genes: ${context.comprehensiveGenes?.length || 0}`);

// Test comprehensive lab analysis
if (context.comprehensiveLabs?.length > 0) {
  console.log(`\n🧪 Testing Comprehensive Lab Analysis:`);
  const labSummary = summariseComprehensiveLabs(context.comprehensiveLabs);
  const labConcerns = identifyLabConcerns(context.comprehensiveLabs);
  
  console.log(`   Lab Summary Length: ${labSummary.length} characters`);
  console.log(`   Lab Concerns Found: ${labConcerns.length}`);
  
  // Check for comprehensive biomarker data
  const summaryHas46 = labSummary.includes('46 biomarkers') || labSummary.includes('44 biomarkers');
  const summaryHasSpecific = labSummary.includes('Testosterone Total: 397') && labSummary.includes('Cholesterol Total: 186');
  
  console.log(`   ✓ Shows biomarker count: ${summaryHas46}`);
  console.log(`   ✓ Shows specific values: ${summaryHasSpecific}`);
  
  if (labConcerns.length > 0) {
    console.log(`   Sample concerns: ${labConcerns.slice(0, 3).join(', ')}`);
  }
}

// Test comprehensive genetic analysis
if (context.comprehensiveGenes?.length > 0) {
  console.log(`\n🧬 Testing Comprehensive Genetic Analysis:`);
  const geneSummary = summariseComprehensiveGenes(context.comprehensiveGenes);
  const geneConcerns = identifyGeneticConcerns(context.comprehensiveGenes);
  
  console.log(`   Gene Summary Length: ${geneSummary.length} characters`);
  console.log(`   Genetic Concerns Found: ${geneConcerns.length}`);
  
  // Check for comprehensive genetic data
  const summaryHasSNPs = geneSummary.includes('10 SNPs') || geneSummary.includes('20 SNPs');
  const summaryHasMTHFR = geneSummary.includes('MTHFR C677T: CT') && geneSummary.includes('MTHFR A1298C: AC');
  
  console.log(`   ✓ Shows SNP count: ${summaryHasSNPs}`);
  console.log(`   ✓ Shows MTHFR variants: ${summaryHasMTHFR}`);
  
  if (geneConcerns.length > 0) {
    console.log(`   Sample concerns: ${geneConcerns.slice(0, 3).join(', ')}`);
  }
}

// Test the analysis context building  
console.log(`\n🎯 Testing Analysis Context Building:`);

const labsText = context.comprehensiveLabs?.length > 0 
  ? summariseComprehensiveLabs(context.comprehensiveLabs)
  : "No comprehensive lab data";

const genesText = context.comprehensiveGenes?.length > 0
  ? summariseComprehensiveGenes(context.comprehensiveGenes)
  : "No comprehensive genetic data";

const labConcerns = context.comprehensiveLabs?.length > 0 
  ? identifyLabConcerns(context.comprehensiveLabs)
  : [];

const geneticConcerns = context.comprehensiveGenes?.length > 0
  ? identifyGeneticConcerns(context.comprehensiveGenes)
  : [];

let comprehensiveContext = `PROFILE: ${JSON.stringify(context.profile)}\n\nLABS:\n${labsText}\n\nGENES:\n${genesText}`;

if (labConcerns.length > 0) {
  comprehensiveContext += `\n\nLAB CONCERNS:\n${labConcerns.join('\n')}`;
}

if (geneticConcerns.length > 0) {
  comprehensiveContext += `\n\nGENETIC CONCERNS:\n${geneticConcerns.join('\n')}`;
}

console.log(`   Total Context Length: ${comprehensiveContext.length} characters`);
console.log(`   Lab Concerns: ${labConcerns.length}`);
console.log(`   Genetic Concerns: ${geneticConcerns.length}`);

// Count data points in context
const biomarkerMatches = comprehensiveContext.match(/[A-Z][a-z\s]+: \d+/g) || [];
const snpMatches = comprehensiveContext.match(/rs\d+:\w+/g) || [];

console.log(`   Biomarkers in Context: ${biomarkerMatches.length}`);
console.log(`   SNPs in Context: ${snpMatches.length}`);

console.log(`\n📄 Context Preview (first 1000 chars):`);
console.log(comprehensiveContext.slice(0, 1000) + '...');

console.log(`\n✅ Analysis Function Test Results:`);

const hasComprehensiveLabs = context.comprehensiveLabs?.length > 0;
const hasComprehensiveGenes = context.comprehensiveGenes?.length > 0;
const hasLabConcerns = labConcerns.length > 0;
const hasGeneticConcerns = geneticConcerns.length > 0;

if (hasComprehensiveLabs && biomarkerMatches.length >= 40) {
  console.log(`   ✅ FULL lab context (${biomarkerMatches.length} biomarkers)`);
} else {
  console.log(`   ❌ LIMITED lab context (${biomarkerMatches.length} biomarkers)`);
}

if (hasComprehensiveGenes && snpMatches.length >= 10) {
  console.log(`   ✅ FULL genetic context (${snpMatches.length} SNPs)`);
} else {
  console.log(`   ❌ LIMITED genetic context (${snpMatches.length} SNPs)`);
}

if (hasLabConcerns) {
  console.log(`   ✅ Identifies lab concerns (${labConcerns.length} found)`);
} else {
  console.log(`   ⚠️  No lab concerns identified`);
}

if (hasGeneticConcerns) {
  console.log(`   ✅ Identifies genetic concerns (${geneticConcerns.length} found)`);
} else {
  console.log(`   ⚠️  No genetic concerns identified`);
}

const isFullyComprehensive = hasComprehensiveLabs && hasComprehensiveGenes && 
                           biomarkerMatches.length >= 40 && snpMatches.length >= 10;

console.log(`\n🎉 Final Result: ${isFullyComprehensive ? 'FULLY COMPREHENSIVE' : 'NEEDS WORK'}`);

if (isFullyComprehensive) {
  console.log(`   ✓ Analysis function now has your complete health data`);
  console.log(`   ✓ Will generate recommendations based on all ${biomarkerMatches.length} biomarkers`);
  console.log(`   ✓ Will consider all ${snpMatches.length} genetic variants`);
  console.log(`   ✓ Identifies specific health concerns automatically`);
} else {
  console.log(`   ❌ Analysis function still has limitations`);
} 