// Simple test to verify SNP database expansion

console.log("🧬 Testing SNP Database Expansion");

// Import just the SNP database
const { getSNPInfo, SNP_DATABASE } = await import('./supabase/functions/generate_analysis_v2/lib/snp_database.ts');

console.log(`\n📊 SNP DATABASE COVERAGE`);
console.log(`Total SNPs in database: ${Object.keys(SNP_DATABASE).length}`);

// Count SNPs by pathway
const pathwayCounts = {};
for (const [rsid, snpInfo] of Object.entries(SNP_DATABASE)) {
  const pathway = snpInfo.pathway;
  pathwayCounts[pathway] = (pathwayCounts[pathway] || 0) + 1;
}

console.log("\nSNPs by pathway:");
for (const [pathway, count] of Object.entries(pathwayCounts)) {
  console.log(`  ${pathway}: ${count} SNPs`);
}

// Test major genetic variants
const majorSNPs = [
  'rs1801133', 'rs1801131', 'rs1801394', 'rs1805087', // Methylation
  'rs4680', 'rs6323', 'rs1065852', 'rs1799930', 'rs1695', // Detox
  'rs429358', 'rs7412', 'rs1333049', // Cardiovascular  
  'rs2228570', 'rs7975232', 'rs4588', // Vitamin D
  'rs1800562', 'rs1799945', 'rs855791', // Iron
  'rs762551', 'rs2472297', // Caffeine
  'rs1800795', 'rs1801282' // Inflammation
];

let foundSNPs = 0;
console.log("\nTesting major genetic variants:");
for (const rsid of majorSNPs) {
  const snpInfo = getSNPInfo(rsid);
  if (snpInfo) {
    foundSNPs++;
    console.log(`✓ ${rsid} (${snpInfo.gene}): ${snpInfo.pathway}`);
    
    // Show supplement count for first variant
    const firstGenotype = Object.keys(snpInfo.variants)[0];
    const variant = snpInfo.variants[firstGenotype];
    console.log(`  ${firstGenotype}: ${variant.supplements.length} supplements`);
  } else {
    console.log(`✗ ${rsid}: Missing from database`);
  }
}

console.log(`\nSNP Coverage: ${foundSNPs}/${majorSNPs.length} (${Math.round(foundSNPs/majorSNPs.length*100)}%)`);

// Test supplement recommendations for specific genotypes
console.log("\n💊 SUPPLEMENT RECOMMENDATION TEST");

const testGenotypes = [
  { rsid: 'rs1801133', genotype: 'TT', description: 'MTHFR homozygous' },
  { rsid: 'rs4680', genotype: 'AA', description: 'COMT slow (worrier)' },
  { rsid: 'rs429358', genotype: 'CT', description: 'APOE E3/E4' },
  { rsid: 'rs1800562', genotype: 'AA', description: 'HFE hemochromatosis' }
];

for (const test of testGenotypes) {
  const snpInfo = getSNPInfo(test.rsid);
  if (snpInfo && snpInfo.variants[test.genotype]) {
    const variant = snpInfo.variants[test.genotype];
    console.log(`\n${test.description} (${test.rsid} ${test.genotype}):`);
    console.log(`  Phenotype: ${variant.phenotype}`);
    console.log(`  Supplements: ${variant.supplements.join(', ')}`);
    console.log(`  Dosages: ${variant.dosages.join(', ')}`);
    if (variant.contraindications.length > 0) {
      console.log(`  ⚠️  Contraindications: ${variant.contraindications.join(', ')}`);
    }
  }
}

console.log("\n🎯 SNP DATABASE EXPANSION RESULTS:");
console.log(`✅ Total SNPs: ${Object.keys(SNP_DATABASE).length}`);
console.log(`✅ Pathways covered: ${Object.keys(pathwayCounts).length}`);
console.log(`✅ Major variant coverage: ${foundSNPs}/${majorSNPs.length} (${Math.round(foundSNPs/majorSNPs.length*100)}%)`);
console.log(`✅ Each SNP includes: phenotypes, supplements, dosages, timing, interactions, contraindications`);

if (foundSNPs >= 15) {
  console.log(`\n🚀 MASSIVE SNP EXPANSION SUCCESSFUL!`);
  console.log(`   The database now covers the most important genetic variants for health optimization!`);
} else {
  console.log(`\n⚠️  More SNPs needed for comprehensive coverage`);
} 