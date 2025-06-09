// Regenerate vector embeddings for existing user data
// This fixes the incomplete embeddings from the old limited system

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing environment variables");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

console.log("🔄 Regenerating Vector Embeddings with Complete Data");

// Get user ID from uploaded files instead
const { data: userFiles } = await supabase.from('uploaded_files').select('user_id').limit(1);
const userId = userFiles[0]?.user_id;

if (!userId) {
  console.error("No user found");
  Deno.exit(1);
}

console.log(`👤 User ID: ${userId}`);

// Get complete lab data
const { data: labData } = await supabase
  .from('lab_biomarkers')
  .select('biomarker_data, file_id')
  .eq('user_id', userId);

// Get complete genetic data  
const { data: geneticData } = await supabase
  .from('genetic_markers')
  .select('snp_data, file_id')
  .eq('user_id', userId);

// Get file info
const { data: files } = await supabase
  .from('uploaded_files')
  .select('id, file_name')
  .eq('user_id', userId);

const fileMap = Object.fromEntries(files.map(f => [f.id, f.file_name]));

console.log(`📊 Found Data:`);
console.log(`   Lab Records: ${labData?.length || 0}`);
console.log(`   Genetic Records: ${geneticData?.length || 0}`);

// Regenerate lab embeddings
if (labData && labData.length > 0) {
  for (const lab of labData) {
    if (lab.biomarker_data && Object.keys(lab.biomarker_data).length > 0) {
      const biomarkerCount = Object.keys(lab.biomarker_data).length;
      const fileName = fileMap[lab.file_id] || 'unknown';
      
      console.log(`🧪 Regenerating lab embeddings: ${biomarkerCount} biomarkers from ${fileName}`);
      
      // Create comprehensive summary
      const allBiomarkers = Object.keys(lab.biomarker_data);
      const headlineKeys = biomarkerCount <= 50 ? allBiomarkers : allBiomarkers.slice(0, 30);
      const summary = `Lab file ${fileName} parsed ${biomarkerCount.toLocaleString()} biomarkers. Sample: ${headlineKeys.map(k=>`${k}:${lab.biomarker_data[k]}`).join('; ')}${biomarkerCount > 30 ? ` +${biomarkerCount - 30} more` : ''}`;
      
      const items = [
        { user_id: userId, source_type: 'lab_summary', source_id: lab.file_id, content: summary }
      ];
      
      // Store ALL biomarkers in embeddings
      for (const [k, v] of Object.entries(lab.biomarker_data)) {
        items.push({ 
          user_id: userId, 
          source_type: 'lab', 
          source_id: lab.file_id, 
          content: `${k}: ${v}` 
        });
      }
      
      console.log(`   Creating ${items.length} embedding items`);
      
      try {
        await supabase.functions.invoke('embedding_worker', { 
          body: { items } 
        });
        console.log(`   ✅ Lab embeddings created successfully`);
      } catch (err) {
        console.error(`   ❌ Lab embedding error:`, err);
      }
    }
  }
}

// Regenerate genetic embeddings  
if (geneticData && geneticData.length > 0) {
  for (const genetic of geneticData) {
    if (genetic.snp_data && Object.keys(genetic.snp_data).length > 0) {
      const snpCount = Object.keys(genetic.snp_data).length;
      const fileName = fileMap[genetic.file_id] || 'unknown';
      
      console.log(`🧬 Regenerating genetic embeddings: ${snpCount} SNPs from ${fileName}`);
      
      const allSnps = Object.entries(genetic.snp_data);
      const sampleSnps = snpCount <= 100 ? allSnps : allSnps.slice(0, 50);
      const summary = `Genetic file ${fileName} parsed ${snpCount.toLocaleString()} SNPs. Sample: ${sampleSnps.map(([rs, gt]) => `${rs}:${gt}`).join('; ')}${snpCount > 50 ? ` +${snpCount - 50} more` : ''}`;
      
      const items = [
        { user_id: userId, source_type: 'genetic_summary', source_id: genetic.file_id, content: summary }
      ];
      
      // Store ALL SNPs in embeddings
      for (const [rsid, genotype] of allSnps) {
        items.push({
          user_id: userId,
          source_type: 'genetic', 
          source_id: genetic.file_id,
          content: `${rsid}: ${genotype}`
        });
      }
      
      console.log(`   Creating ${items.length} embedding items`);
      
      try {
        await supabase.functions.invoke('embedding_worker', { 
          body: { items } 
        });
        console.log(`   ✅ Genetic embeddings created successfully`);
      } catch (err) {
        console.error(`   ❌ Genetic embedding error:`, err);
      }
    }
  }
}

console.log(`\n🎯 Embedding Regeneration Complete!`);
console.log(`   • All biomarkers now in vector memory`);
console.log(`   • All SNPs now in vector memory`);
 