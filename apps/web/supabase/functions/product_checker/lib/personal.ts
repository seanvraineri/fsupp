import { Ingredient } from "./ingredients.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface PersonalScore { score:number; bullets:string[] }

interface UserCtx {
  assessment?:{ allergies?:string[]; goals?:string[] };
  labs?: any[]; // simplified for backward compatibility
  genetics?: any; // simplified for backward compatibility
  supplements?: any[];
  // NEW: Comprehensive data access
  comprehensiveLabs?: any[];
  comprehensiveGenetics?: any[];
}

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// Updated function to fetch comprehensive data directly from tables
async function fetchComprehensiveContext(uid: string): Promise<UserCtx> {
  console.log(`🔍 Fetching comprehensive context for user: ${uid}`);
  
  // Fetch assessment data
  const { data: assessment } = await sb
    .from('health_assessments')
    .select('allergies, health_goals, current_medications, medical_conditions')
    .eq('user_id', uid)
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch comprehensive lab data (same as generate_analysis)
  const { data: labData } = await sb
    .from('lab_biomarkers')
    .select('biomarker_data, vitamin_d, vitamin_b12, iron, ferritin, magnesium, cholesterol_total, hdl, ldl, triglycerides, glucose, hba1c, tsh, test_date, lab_name, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch comprehensive genetic data (same as generate_analysis) 
  const { data: geneticData } = await sb
    .from('genetic_markers')
    .select('snp_data, mthfr_c677t, mthfr_a1298c, apoe_variant, vdr_variants, comt_variants, source_company, chip_version, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(3);

  console.log(`📊 Found: ${labData?.length || 0} lab panels, ${geneticData?.length || 0} genetic files`);

  // Process comprehensive lab data
  const comprehensiveLabs = [];
  const simplifiedLabs = []; // for backward compatibility
  
  if (labData && labData.length > 0) {
    for (const lab of labData) {
      // Store comprehensive data for new analysis
      if (lab.biomarker_data && Object.keys(lab.biomarker_data).length > 0) {
        comprehensiveLabs.push({
          biomarker_data: lab.biomarker_data,
          biomarker_count: Object.keys(lab.biomarker_data).length,
          test_date: lab.test_date,
          lab_name: lab.lab_name,
          created_at: lab.created_at
        });
        
        // Also create simplified version for backward compatibility
        const flattenedLab: Record<string, number> = {};
        for (const [key, value] of Object.entries(lab.biomarker_data)) {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const numericValue = parseFloat(String(value));
          if (!isNaN(numericValue)) {
            flattenedLab[normalizedKey] = numericValue;
          }
        }
        
        // Add common columns
        if (lab.vitamin_d) flattenedLab.vitamin_d = lab.vitamin_d;
        if (lab.vitamin_b12) flattenedLab.vitamin_b12 = lab.vitamin_b12;
        if (lab.iron) flattenedLab.iron = lab.iron;
        if (lab.ferritin) flattenedLab.ferritin = lab.ferritin;
        if (lab.magnesium) flattenedLab.magnesium = lab.magnesium;
        if (lab.cholesterol_total) flattenedLab.cholesterol_total = lab.cholesterol_total;
        if (lab.hdl) flattenedLab.hdl = lab.hdl;
        if (lab.ldl) flattenedLab.ldl = lab.ldl;
        if (lab.triglycerides) flattenedLab.triglycerides = lab.triglycerides;
        if (lab.glucose) flattenedLab.glucose = lab.glucose;
        if (lab.hba1c) flattenedLab.hba1c = lab.hba1c;
        if (lab.tsh) flattenedLab.tsh = lab.tsh;
        
        simplifiedLabs.push(flattenedLab);
      }
    }
  }

  // Process comprehensive genetic data
  const comprehensiveGenetics = [];
  const simplifiedGenetics: Record<string, any> = {};
  
  if (geneticData && geneticData.length > 0) {
    for (const genetic of geneticData) {
      // Store comprehensive data
      if (genetic.snp_data && Object.keys(genetic.snp_data).length > 0) {
        comprehensiveGenetics.push({
          snp_data: genetic.snp_data,
          snp_count: Object.keys(genetic.snp_data).length,
          source_company: genetic.source_company,
          chip_version: genetic.chip_version,
          created_at: genetic.created_at
        });
        
        // Extract common genetic variants for simplified access
        if (genetic.mthfr_c677t) simplifiedGenetics.mthfr_c677t = genetic.mthfr_c677t;
        if (genetic.mthfr_a1298c) simplifiedGenetics.mthfr_a1298c = genetic.mthfr_a1298c;
        if (genetic.apoe_variant) simplifiedGenetics.apoe_variant = genetic.apoe_variant;
        if (genetic.vdr_variants) simplifiedGenetics.vdr_variants = genetic.vdr_variants;
        if (genetic.comt_variants) simplifiedGenetics.comt_variants = genetic.comt_variants;
        
        // Extract key SNPs from snp_data for simplified access
        for (const [rsid, genotype] of Object.entries(genetic.snp_data)) {
          if (rsid === 'rs4680') simplifiedGenetics.comt = genotype; // COMT
          if (rsid === 'rs1801133') simplifiedGenetics.mthfr_c677t = genotype; // MTHFR C677T
          if (rsid === 'rs1801131') simplifiedGenetics.mthfr_a1298c = genotype; // MTHFR A1298C
          if (rsid === 'rs2228570') simplifiedGenetics.vdr_foki = genotype; // VDR FokI
          if (rsid === 'rs174547') simplifiedGenetics.fads1 = genotype; // FADS1
          if (rsid === 'rs174575') simplifiedGenetics.fads2 = genotype; // FADS2
          if (rsid === 'rs1800562') simplifiedGenetics.hfe_c282y = genotype; // HFE C282Y
          if (rsid === 'rs1799945') simplifiedGenetics.hfe_h63d = genotype; // HFE H63D
          if (rsid === 'rs366631') simplifiedGenetics.gstm1 = genotype === 'null' ? 'null' : 'present'; // GSTM1
          if (rsid === 'rs17856199') simplifiedGenetics.gstt1 = genotype === 'null' ? 'null' : 'present'; // GSTT1
          if (rsid === 'rs429358') simplifiedGenetics.apoe_rs429358 = genotype; // APOE rs429358
          if (rsid === 'rs762551') simplifiedGenetics.cyp1a2 = genotype; // CYP1A2
          if (rsid === 'rs4149056') simplifiedGenetics.slco1b1 = genotype; // SLCO1B1
        }
      }
    }
  }

  return {
    assessment: assessment ? {
      allergies: assessment.allergies || [],
      goals: assessment.health_goals || []
    } : undefined,
    labs: simplifiedLabs, // backward compatibility
    genetics: simplifiedGenetics, // backward compatibility
    comprehensiveLabs, // new comprehensive access
    comprehensiveGenetics // new comprehensive access
  };
}

// Legacy function for backward compatibility
async function fetchContext(uid:string):Promise<UserCtx>{
  return fetchComprehensiveContext(uid);
}

export async function scorePersonal(user_id:string, ingredients:Ingredient[]):Promise<PersonalScore>{
  const ctx = await fetchContext(user_id);
  let score = 80;
  const bullets:string[]=[];

  // allergy check
  const allergies:string[] = ctx.assessment?.allergies ?? [];
  const conflicts = ingredients.filter(ing=> allergies.some(a=> ing.name.toLowerCase().includes(a.toLowerCase())));
  if(conflicts.length){
    score -= 30;
    bullets.push(`Possible allergy conflict: ${conflicts.map(c=>c.name).join(', ')}`);
  }

  // good ingredients
  const goodPct = ingredients.filter(i=>i.quality==="good").length / ingredients.length;
  score += Math.round(goodPct*10);

  /* ---------- COMPREHENSIVE LAB BIOMARKERS ANALYSIS ---------- */
  
  // Use comprehensive data if available, fall back to simplified
  let biomarkerAnalysis: Record<string, number> = {};
  
  if (ctx.comprehensiveLabs && ctx.comprehensiveLabs.length > 0) {
    // Use most recent comprehensive lab data
    const latestLab = ctx.comprehensiveLabs[0];
    console.log(`🧪 Using comprehensive lab data: ${latestLab.biomarker_count} biomarkers from ${latestLab.lab_name}`);
    
    // Extract all biomarkers from comprehensive data
    for (const [key, value] of Object.entries(latestLab.biomarker_data)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const numericValue = parseFloat(String(value));
      if (!isNaN(numericValue)) {
        biomarkerAnalysis[normalizedKey] = numericValue;
      }
    }
  } else if (ctx.labs && ctx.labs.length > 0) {
    // Fall back to simplified lab data
    biomarkerAnalysis = ctx.labs[0] ?? {};
    console.log(`🧪 Using simplified lab data: ${Object.keys(biomarkerAnalysis).length} biomarkers`);
  }

  const low = (name:string, thresh:number)=> typeof biomarkerAnalysis[name]==="number" && biomarkerAnalysis[name] < thresh;
  const high = (name:string, thresh:number)=> typeof biomarkerAnalysis[name]==="number" && biomarkerAnalysis[name] > thresh;

  // === VITAMINS (Fat-Soluble) ===
  if(low("vitamin_d",30) || low("25_oh_d",30) || low("25ohd",30)){
    score -= 10;
    const vitDLevel = biomarkerAnalysis.vitamin_d || biomarkerAnalysis['25_oh_d'] || biomarkerAnalysis['25ohd'] || 'low';
    bullets.push(`💊 **Perfect for Your Vitamin D**: Your vitamin D at ${vitDLevel} ng/mL tells us this D3 + K2 combo would work exceptionally well for you - we think this is exactly what your body needs right now.`);
  }
  if(low("vitamin_a",30) || low("retinol",30)){
    score += 5;
    bullets.push(`🥕 **Great Choice for You**: With your vitamin A levels, we believe the retinol in this product would be particularly beneficial for your health profile.`);
  }
  if(low("vitamin_e",12) || low("tocopherol",12)){
    score += 5;
    bullets.push(`🛡️ **Antioxidant Support You Need**: Your vitamin E levels suggest this mixed tocopherol formula would work really well for your antioxidant needs.`);
  }
  if(low("vitamin_k",0.4) || low("phylloquinone",0.4)){
    score += 5;
    bullets.push(`🦴 **Bone Health Boost**: We think the K2 (MK-7) in this product would be particularly effective for your current vitamin K status.`);
  }

  // === B-VITAMINS (Enhanced Coverage) ===
  if(low("vitamin_b12",400) || low("b12",400) || low("cobalamin",400) || low("methylcobalamin",400)){
    score -= 8;
    const b12Level = biomarkerAnalysis.vitamin_b12 || biomarkerAnalysis.b12 || biomarkerAnalysis.cobalamin || 'low';
    bullets.push(`🚀 **B12 Boost You Need**: Your B12 at ${b12Level} pg/mL tells us the methylcobalamin in this product is exactly what your body needs right now.`);
  }
  if(low("folate",6) || low("folic_acid",6) || low("5_mthf",6)){
    score -= 8;
    bullets.push(`🧬 **Folate Support Perfect**: Your folate levels suggest the L-methylfolate in this product would be highly beneficial.`);
  }
  if(low("thiamine",70) || low("b1",70) || low("vitamin_b1",70)){
    score += 5;
    bullets.push(`⚡ **B1 Energy Support**: Your thiamine levels indicate this B1 supplementation would boost your energy metabolism.`);
  }
  if(low("riboflavin",6.2) || low("b2",6.2) || low("vitamin_b2",6.2)){
    score += 5;
    bullets.push(`🔋 **B2 Cellular Energy**: Your riboflavin levels suggest this B2 would enhance your cellular energy production.`);
  }
  if(low("niacin",14) || low("b3",14) || low("vitamin_b3",14)){
    score += 5;
    bullets.push(`💊 **B3 Metabolism Support**: Your niacin levels indicate this B3 would benefit your energy metabolism.`);
  }
  if(low("pantothenic_acid",1.8) || low("b5",1.8) || low("vitamin_b5",1.8)){
    score += 5;
    bullets.push(`🌿 **B5 Adrenal Support**: Your pantothenic acid levels suggest this B5 would support your stress response.`);
  }
  if(low("pyridoxine",20) || low("b6",20) || low("vitamin_b6",20) || low("pyridoxal",20)){
    score += 5;
    bullets.push(`🧠 **B6 Neurotransmitter Support**: Your B6 levels indicate this P5P form would optimize your neurotransmitter function.`);
  }
  if(low("biotin",400) || low("b7",400) || low("vitamin_b7",400)){
    score += 5;
    bullets.push(`💅 **Biotin Beauty & Metabolism**: Your biotin levels suggest this supplementation would benefit your hair, skin, and metabolism.`);
  }
  if(low("vitamin_c",11) || low("ascorbic_acid",11)){
    score += 5;
    bullets.push(`🍊 **Vitamin C Immune Support**: Your vitamin C levels indicate this ascorbic acid + bioflavonoids combo would be beneficial.`);
  }

  // === MINERALS (Enhanced Coverage) ===
  if(low("magnesium",1.8) || low("rbc_magnesium",4.2) || low("mg",1.8)){
    score += 8;
    const mgLevel = biomarkerAnalysis.rbc_magnesium || biomarkerAnalysis.magnesium || biomarkerAnalysis.mg || 'low';
    bullets.push(`🌙 **Magnesium Perfect for You**: Your magnesium at ${mgLevel} tells us the glycinate form in this product is an excellent choice for your levels.`);
  }
  if(low("zinc",70) || low("rbc_zinc",12) || low("zn",70)){
    score += 5;
    bullets.push(`🛡️ **Zinc Immune Support**: Your zinc levels suggest the picolinate form in this product would be beneficial.`);
  }
  if(low("iron",60) || low("fe",60)){
    if(!high("ferritin",200)){ // Only if ferritin not high
      score += 8;
      bullets.push(`💪 **Iron Support Needed**: Your iron levels indicate the bisglycinate form in this product would be highly beneficial.`);
    }
  }
  if(low("ferritin",30)){
    score += 8;
    const ferritinLevel = biomarkerAnalysis.ferritin || 'low';
    bullets.push(`⚡ **Iron Stores Need Building**: Your ferritin at ${ferritinLevel} ng/mL tells us iron supplementation in this product would be highly beneficial.`);
  }
  if(high("ferritin",200)){
    score -= 15;
    const ferritinLevel = biomarkerAnalysis.ferritin || 'elevated';
    bullets.push(`⚠️ **High Iron Stores Warning**: Your ferritin at ${ferritinLevel} ng/mL means you should AVOID iron in products!`);
  }
  if(low("selenium",95) || low("se",95)){
    score += 5;
    bullets.push(`🛡️ **Selenium Antioxidant Support**: Your selenium levels suggest the selenomethionine in this product would be beneficial.`);
  }
  if(low("calcium",8.5) || low("ca",8.5)){
    score += 5;
    bullets.push(`🦴 **Calcium Bone Support**: Your calcium levels indicate the citrate form with D3 + K2 in this product would be beneficial.`);
  }
  if(low("potassium",3.5) || low("k",3.5)){
    score += 5;
    bullets.push(`❤️ **Potassium Heart Support**: Your potassium levels suggest this supplementation would benefit your cardiovascular health.`);
  }
  if(low("phosphorus",2.5) || low("phosphate",2.5)){
    score += 5;
    bullets.push(`🦴 **Phosphorus Bone Support**: Your phosphorus levels indicate this supplementation would support bone health.`);
  }

  // === HORMONES ===
  if(high("tsh",3.0)){
    score += 5;
    const tshLevel = biomarkerAnalysis.tsh || 'elevated';
    bullets.push(`🦋 **Thyroid Support**: Your TSH at ${tshLevel} mIU/L suggests the thyroid support nutrients in this product would be beneficial.`);
  }
  if(low("free_t3",3.0) || low("ft3",3.0) || low("t3",3.0)){
    score += 5;
    bullets.push(`🔥 **T3 Metabolism Support**: Your free T3 levels suggest the tyrosine + selenium + zinc in this product would be beneficial.`);
  }
  if(low("testosterone",350) || low("total_testosterone",350)){
    score += 5;
    bullets.push(`💪 **Testosterone Support**: Your testosterone levels suggest the testosterone support nutrients in this product would be beneficial.`);
  }

  // === LIPIDS ===
  if(high("ldl",100) || high("ldl_cholesterol",100)){
    score += 8;
    const ldlLevel = biomarkerAnalysis.ldl || biomarkerAnalysis.ldl_cholesterol || 'elevated';
    bullets.push(`❤️ **LDL Management**: Your LDL at ${ldlLevel} mg/dL suggests plant sterols + red yeast rice in this product would be beneficial.`);
  }
  if(low("hdl",50) || low("hdl_cholesterol",50)){
    score += 5;
    const hdlLevel = biomarkerAnalysis.hdl || biomarkerAnalysis.hdl_cholesterol || 'low';
    bullets.push(`💚 **HDL Support**: Your HDL at ${hdlLevel} mg/dL suggests niacin + omega-3 in this product would be beneficial.`);
  }
  if(high("triglycerides",150) || high("tg",150)){
    score += 8;
    const tgLevel = biomarkerAnalysis.triglycerides || biomarkerAnalysis.tg || 'elevated';
    bullets.push(`🐟 **Triglyceride Support**: Your triglycerides at ${tgLevel} mg/dL suggest high-EPA fish oil in this product would be beneficial.`);
  }
  if(high("cholesterol_total",200) || high("total_cholesterol",200)){
    score -= 5;
    bullets.push(`⚠️ **Cholesterol Management**: Your total cholesterol suggests consulting healthcare provider about supplement choice.`);
  }

  // === METABOLIC ===
  if(high("glucose",99) || high("fasting_glucose",99)){
    score += 8;
    const glucoseLevel = biomarkerAnalysis.glucose || biomarkerAnalysis.fasting_glucose || 'elevated';
    bullets.push(`🍃 **Glucose Support**: Your glucose at ${glucoseLevel} mg/dL suggests berberine + chromium in this product would be beneficial.`);
  }
  if(high("hba1c",5.6) || high("hemoglobin_a1c",5.6)){
    score += 8;
    const hba1cLevel = biomarkerAnalysis.hba1c || biomarkerAnalysis.hemoglobin_a1c || 'elevated';
    bullets.push(`📊 **Blood Sugar Support**: Your HbA1c at ${hba1cLevel}% suggests alpha-lipoic acid + chromium in this product would be beneficial.`);
  }

  // === INFLAMMATION ===
  if(high("crp",3.0) || high("hs_crp",3.0) || high("c_reactive_protein",3.0)){
    score += 8;
    const crpLevel = biomarkerAnalysis.crp || biomarkerAnalysis.hs_crp || biomarkerAnalysis.c_reactive_protein || 'elevated';
    bullets.push(`🔥 **Inflammation Support**: Your CRP at ${crpLevel} mg/L suggests curcumin + omega-3 in this product would be highly beneficial.`);
  }

  // === AMINO ACIDS ===
  if(high("homocysteine",10)){
    score += 8;
    const hcyLevel = biomarkerAnalysis.homocysteine || 'elevated';
    bullets.push(`🧬 **Methylation Support**: Your homocysteine at ${hcyLevel} μmol/L suggests B-complex + TMG in this product would be beneficial.`);
  }

  // === FATTY ACIDS ===
  if(low("omega_3_index",4.0) || low("omega3_index",4.0)){
    score += 8;
    bullets.push(`🐟 **Omega-3 Optimization**: Your omega-3 index suggests EPA/DHA in this product would be highly beneficial.`);
  }

  /* ---------- COMPREHENSIVE GENETICS ANALYSIS ---------- */
  
  // Use comprehensive genetic data if available
  let geneticAnalysis: Record<string, any> = ctx.genetics ?? {};
  let comprehensiveSnpData: Record<string, string> = {};
  
  if (ctx.comprehensiveGenetics && ctx.comprehensiveGenetics.length > 0) {
    const latestGenetic = ctx.comprehensiveGenetics[0];
    console.log(`🧬 Using comprehensive genetic data: ${latestGenetic.snp_count} SNPs from ${latestGenetic.source_company}`);
    comprehensiveSnpData = latestGenetic.snp_data || {};
    
    // Merge with simplified genetics for backward compatibility
    geneticAnalysis = { ...geneticAnalysis };
  }

  const supplements_lower = ingredients.map(i => i.name.toLowerCase()).join(' ');

  // === METHYLATION & FOLATE PATHWAY ===
  const mthfrC677T = comprehensiveSnpData['rs1801133'] || geneticAnalysis.mthfr_c677t;
  const mthfrA1298C = comprehensiveSnpData['rs1801131'] || geneticAnalysis.mthfr_a1298c;
  
  if(mthfrC677T?.toUpperCase?.() === "TT" || mthfrC677T?.toUpperCase?.() === "CT"){
    if(supplements_lower.includes('methylfolate') || supplements_lower.includes('5-mthf') || supplements_lower.includes('l-methylfolate')){
      score += 10;
      bullets.push(`🧬 **PERFECT for Your MTHFR Genetics**: Your MTHFR ${mthfrC677T} variant means the methylfolate in this product is EXACTLY what your body needs - we couldn't have chosen better for your unique genetics!`);
    } else if(supplements_lower.includes('folic acid')){
      score -= 10;
      bullets.push(`⚠️ **Your MTHFR Genetics Need Different**: With your MTHFR ${mthfrC677T} variant, we think methylfolate would work much better for you than the folic acid in this product.`);
    }
    if(supplements_lower.includes('methylcobalamin') || supplements_lower.includes('methyl b12')){
      score += 8;
      bullets.push(`🚀 **Ideal B12 for Your Genetics**: The methylcobalamin in this product is specifically what we'd recommend for your MTHFR variant - this form will work best with your genetic makeup!`);
    }
  }
  
  if(mthfrA1298C?.toUpperCase?.() === "CC" || mthfrA1298C?.toUpperCase?.() === "AC"){
    if(supplements_lower.includes('methylfolate')){
      score += 8;
      bullets.push(`🧬 **MTHFR A1298C Optimization**: Your MTHFR A1298C ${mthfrA1298C} variant means the methylfolate in this product is specifically beneficial for your genetics!`);
    }
  }

  // === NEUROTRANSMITTER & MOOD ===
  const comt = comprehensiveSnpData['rs4680'] || geneticAnalysis.comt;
  
  if(comt?.toUpperCase?.() === "AA"){
    if(supplements_lower.includes('magnesium')){
      score += 8;
      bullets.push(`🧠 **Magnesium Made for Your COMT**: Your COMT slow variant means the magnesium in this product will work particularly well for you - we think this will be excellent for supporting your dopamine balance and stress response!`);
    }
    if(supplements_lower.includes('same') && !supplements_lower.includes('low dose')){
      score -= 5;
      bullets.push(`⚠️ **Caution with Your COMT Genetics**: Your COMT slow variant suggests the high-dose SAMe in this product might cause overmethylation - we think a lower dose would work better for your genetics.`);
    }
  }
  
  if(comt?.toUpperCase?.() === "GG"){
    if(supplements_lower.includes('tyrosine') || supplements_lower.includes('l-tyrosine')){
      score += 8;
      bullets.push(`⚡ **Tyrosine Tailored for You**: With your COMT fast variant, the tyrosine in this product is exactly what we'd choose to support your dopamine production - this will work really well for your genetics!`);
    }
  }

  // === VITAMIN D PATHWAY ===
  const vdrFokI = comprehensiveSnpData['rs2228570'] || geneticAnalysis.vdr_foki;
  
  if(vdrFokI?.toUpperCase?.() === "CC" || geneticAnalysis.vdr_variants?.includes("rs2228570 CC")){
    if(supplements_lower.includes('vitamin d') && (supplements_lower.includes('5000') || supplements_lower.includes('4000'))){
      score += 8;
      bullets.push(`☀️ **Higher Dose Perfect for Your VDR**: Your VDR genetic variant means the higher dose vitamin D in this product is exactly what you need - we think this dosage will work much better for your genetics than standard amounts!`);
    } else if(supplements_lower.includes('vitamin d')){
      score += 5;
      bullets.push(`💡 **Good Vitamin D Choice**: The vitamin D in this product is beneficial for your VDR variant, though we think you might need higher doses than average for optimal results.`);
    }
  }

  // === OMEGA-3 METABOLISM ===
  const fads1 = comprehensiveSnpData['rs174547'] || geneticAnalysis.fads1;
  const fads2 = comprehensiveSnpData['rs174575'] || geneticAnalysis.fads2;
  
  if(fads1?.toUpperCase?.() === "TT" || fads2?.toUpperCase?.() === "GG"){
    if(supplements_lower.includes('epa') || supplements_lower.includes('dha') || supplements_lower.includes('fish oil')){
      score += 10;
      bullets.push(`🧬 **FADS Genetics Optimization**: Your FADS variant means preformed EPA/DHA in this product is ESSENTIAL for your genetics - you cannot convert plant omega-3s efficiently!`);
    } else if(supplements_lower.includes('ala') || supplements_lower.includes('flax')){
      score -= 5;
      bullets.push(`⚠️ **Your FADS Genetics Need EPA/DHA**: With your FADS variant, you cannot convert ALA efficiently - you need the EPA/DHA forms instead!`);
    }
  }

  // === IRON METABOLISM ===
  const hfeC282Y = comprehensiveSnpData['rs1800562'] || geneticAnalysis.hfe_c282y;
  const hfeH63D = comprehensiveSnpData['rs1799945'] || geneticAnalysis.hfe_h63d;
  
  if(hfeC282Y?.toUpperCase?.() === "AA" || hfeH63D?.toUpperCase?.() === "CC"){
    if(supplements_lower.includes('iron')){
      score -= 20;
      bullets.push(`🚨 **HFE Hemochromatosis Genetics**: Your HFE variant means you should NEVER take iron supplements - this is dangerous for your genetics!`);
    } else {
      score += 5;
      bullets.push(`✅ **Safe Choice for HFE Genetics**: Good that this product avoids iron - your HFE variant makes iron supplementation dangerous!`);
    }
  }

  // === DETOXIFICATION ===
  const gstm1 = comprehensiveSnpData['rs366631'] || geneticAnalysis.gstm1;
  const gstt1 = comprehensiveSnpData['rs17856199'] || geneticAnalysis.gstt1;
  
  if(gstm1 === "null" || gstt1 === "null"){
    if(supplements_lower.includes('nac') || supplements_lower.includes('n-acetyl-cysteine')){
      score += 8;
      bullets.push(`🧬 **GST Genetics Detox Support**: Your GST null variant means the NAC in this product is excellent for supporting your compromised detoxification genetics!`);
    }
    if(supplements_lower.includes('milk thistle') || supplements_lower.includes('silymarin')){
      score += 5;
      bullets.push(`🧬 **Liver Support for Your Genetics**: Your GST null variant means the milk thistle in this product is beneficial for supporting your liver detoxification!`);
    }
  }

  // === CARDIOVASCULAR ===
  const apoeE4 = comprehensiveSnpData['rs429358'] || geneticAnalysis.apoe_rs429358;
  
  if(apoeE4?.toUpperCase?.().includes("C") || geneticAnalysis.apoe_variant?.includes("E4")){
    if(supplements_lower.includes('dha') || supplements_lower.includes('curcumin')){
      score += 8;
      bullets.push(`🧬 **APOE4 Brain Protection**: Your APOE4 variant means the DHA/curcumin in this product is excellent for protecting your brain health - this is specifically what you need!`);
    }
    if(supplements_lower.includes('saturated fat') || supplements_lower.includes('coconut oil')){
      score -= 8;
      bullets.push(`⚠️ **APOE4 Genetics Warning**: Your APOE4 variant means you should limit saturated fats and focus on omega-3s instead!`);
    }
  }

  // === CAFFEINE METABOLISM ===
  const cyp1a2 = comprehensiveSnpData['rs762551'] || geneticAnalysis.cyp1a2;
  
  if(cyp1a2?.toUpperCase?.() === "AA"){
    if(supplements_lower.includes('caffeine')){
      score -= 8;
      bullets.push(`⚠️ **Caffeine Sensitivity Warning**: Your CYP1A2 slow metabolizer genetics mean the caffeine in this product may cause issues for you!`);
    }
    if(supplements_lower.includes('theanine') || supplements_lower.includes('l-theanine')){
      score += 5;
      bullets.push(`🧬 **Perfect for Caffeine Sensitivity**: Your CYP1A2 slow variant means the L-theanine in this product is beneficial for promoting relaxation!`);
    }
  }

  // === STATIN INTERACTIONS ===
  const slco1b1 = comprehensiveSnpData['rs4149056'] || geneticAnalysis.slco1b1;
  
  if(slco1b1?.toUpperCase?.() === "CC"){
    if(supplements_lower.includes('coq10') || supplements_lower.includes('ubiquinol')){
      score += 8;
      bullets.push(`🧬 **Essential for Statin Genetics**: Your SLCO1B1 variant means the CoQ10 in this product is essential if you're taking statins - your genetics increase muscle pain risk!`);
    }
  }

  console.log(`📊 Product analysis complete: Score ${score}, ${bullets.length} personalization factors found`);

  // clamp
  score = Math.min(100, Math.max(0, score));
  if(bullets.length===0) bullets.push("No specific personalization factors detected for your profile.");
  return { score, bullets };
} 
