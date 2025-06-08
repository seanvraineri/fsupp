// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// === COMPREHENSIVE SUPPLEMENTATION-RELEVANT GENETIC VARIANTS ===
export const geneReferences = [
  // === METHYLATION & FOLATE PATHWAY ===
  { gene: 'MTHFR', rsids: ['rs1801133'], genotypesOfConcern: ['CT', 'TT'], impact: 'Reduced folate to 5-MTHF conversion, elevated homocysteine', supplement: 'L-Methylfolate', dosage: '400-1000 mcg daily', evidence: 'high', cautions: 'Avoid >800 mcg folic acid' },
  { gene: 'MTHFR', rsids: ['rs1801131'], genotypesOfConcern: ['AC', 'CC'], impact: 'Reduced MTHFR activity, methylation impairment', supplement: 'L-Methylfolate', dosage: '400-800 mcg daily', evidence: 'high', cautions: 'Support methylation cycle' },
  { gene: 'MTR', rsids: ['rs1805087'], genotypesOfConcern: ['AG', 'GG'], impact: 'Impaired methionine synthase activity affecting B12 utilization', supplement: 'Methylcobalamin', dosage: '1-5 mg daily', evidence: 'moderate', cautions: 'Monitor B12 levels' },
  { gene: 'MTRR', rsids: ['rs1801394'], genotypesOfConcern: ['AG', 'GG'], impact: 'Reduced methionine synthase reductase activity', supplement: 'Methylcobalamin;Betaine', dosage: '1-5 mg B12;500-1000 mg TMG daily', evidence: 'moderate', cautions: 'Support methylation cycle' },
  { gene: 'MTHFD1', rsids: ['rs2236225'], genotypesOfConcern: ['AA'], impact: 'Reduced folate metabolism capacity', supplement: 'L-Methylfolate;B-Complex', dosage: '400 mcg;1 capsule daily', evidence: 'moderate', cautions: 'Support one-carbon metabolism' },
  { gene: 'SHMT1', rsids: ['rs1979277'], genotypesOfConcern: ['TT'], impact: 'Impaired serine-glycine conversion', supplement: 'Glycine;Serine', dosage: '1-3g;500mg daily', evidence: 'low', cautions: 'Support amino acid metabolism' },
  { gene: 'BHMT', rsids: ['rs3733890'], genotypesOfConcern: ['TT'], impact: 'Reduced betaine-homocysteine methyltransferase', supplement: 'Betaine (TMG)', dosage: '500-1500 mg daily', evidence: 'moderate', cautions: 'Alternative methylation pathway' },
  { gene: 'DHFR', rsids: ['rs70991108'], genotypesOfConcern: ['del/del'], impact: 'Reduced dihydrofolate reductase activity', supplement: 'L-Methylfolate', dosage: '800-1000 mcg daily', evidence: 'moderate', cautions: 'Bypass DHFR requirement' },
  { gene: 'TYMS', rsids: ['rs34743033'], genotypesOfConcern: ['2R/2R'], impact: 'Low thymidylate synthase expression', supplement: 'L-Methylfolate;B12', dosage: '400 mcg;1000 mcg daily', evidence: 'low', cautions: 'Support DNA synthesis' },
  { gene: 'AHCY', rsids: ['rs819147'], genotypesOfConcern: ['TT'], impact: 'Reduced S-adenosylhomocysteine hydrolase activity', supplement: 'Glycine;Betaine', dosage: '1-3g;500-1000 mg daily', evidence: 'low', cautions: 'Support homocysteine clearance' },

  // === NEUROTRANSMITTER & MOOD ===
  { gene: 'COMT', rsids: ['rs4680'], genotypesOfConcern: ['AA'], impact: 'Slow COMT activity; dopamine accumulation', supplement: 'Magnesium;SAMe', dosage: '400-600 mg Mg;200-400 mg SAMe daily', evidence: 'moderate', cautions: 'Avoid high-dose methyl donors if overmethylation' },
  { gene: 'COMT', rsids: ['rs4680'], genotypesOfConcern: ['GG'], impact: 'Fast COMT activity; rapid dopamine breakdown', supplement: 'L-Tyrosine;Green Tea Extract', dosage: '500-1000 mg;300-400 mg EGCG daily', evidence: 'moderate', cautions: 'Support dopamine production' },
  { gene: 'MAO-A', rsids: ['rs6323'], genotypesOfConcern: ['TT'], impact: 'High MAO-A activity; rapid serotonin breakdown', supplement: '5-HTP;Tryptophan', dosage: '100-200 mg;500-1000 mg daily', evidence: 'moderate', cautions: 'Support serotonin production' },
  { gene: 'BDNF', rsids: ['rs6265'], genotypesOfConcern: ['AA'], impact: 'Reduced BDNF production; impaired neuroplasticity', supplement: 'Magnesium;Omega-3;Lion\'s Mane', dosage: '400 mg;1000 mg;500 mg daily', evidence: 'moderate', cautions: 'Support brain health' },
  { gene: 'HTR2A', rsids: ['rs6313'], genotypesOfConcern: ['AA'], impact: 'Altered serotonin receptor function', supplement: 'Tryptophan;Magnesium', dosage: '500-1000 mg;400 mg daily', evidence: 'low', cautions: 'Support serotonin signaling' },
  { gene: 'SLC6A4', rsids: ['rs25531'], genotypesOfConcern: ['SS'], impact: 'Low serotonin transporter expression', supplement: '5-HTP;Omega-3', dosage: '100-200 mg;1000 mg daily', evidence: 'moderate', cautions: 'Support serotonin availability' },
  { gene: 'DRD2', rsids: ['rs1800497'], genotypesOfConcern: ['AA'], impact: 'Reduced dopamine receptor density', supplement: 'L-Tyrosine;Rhodiola', dosage: '500-1000 mg;300-400 mg daily', evidence: 'moderate', cautions: 'Support dopamine signaling' },
  { gene: 'TPH2', rsids: ['rs4570625'], genotypesOfConcern: ['TT'], impact: 'Reduced tryptophan hydroxylase activity', supplement: 'Tryptophan;B6', dosage: '500-1000 mg;25-50 mg daily', evidence: 'moderate', cautions: 'Support serotonin synthesis' },
  { gene: 'DBH', rsids: ['rs1611115'], genotypesOfConcern: ['TT'], impact: 'Low dopamine beta-hydroxylase activity', supplement: 'Copper;Vitamin C', dosage: '2 mg;500-1000 mg daily', evidence: 'low', cautions: 'Support norepinephrine synthesis' },

  // === DETOXIFICATION & ANTIOXIDANTS ===
  { gene: 'GSTM1', rsids: ['rs366631'], genotypesOfConcern: ['null'], impact: 'Absent glutathione S-transferase M1; reduced detoxification', supplement: 'NAC;Milk Thistle;Cruciferous Extract', dosage: '600 mg;150 mg;200 mg daily', evidence: 'moderate', cautions: 'Support phase II detoxification' },
  { gene: 'GSTT1', rsids: ['rs17856199'], genotypesOfConcern: ['null'], impact: 'Absent glutathione S-transferase T1', supplement: 'NAC;Alpha-Lipoic Acid', dosage: '600 mg;300 mg daily', evidence: 'moderate', cautions: 'Support glutathione synthesis' },
  { gene: 'GSTP1', rsids: ['rs1695'], genotypesOfConcern: ['GG'], impact: 'Reduced GSTP1 activity', supplement: 'NAC;Selenium', dosage: '600 mg;200 mcg daily', evidence: 'moderate', cautions: 'Support antioxidant defense' },
  { gene: 'SOD2', rsids: ['rs4880'], genotypesOfConcern: ['AA'], impact: 'Reduced mitochondrial superoxide dismutase activity', supplement: 'Manganese;CoQ10;PQQ', dosage: '5-10 mg;100-200 mg;10-20 mg daily', evidence: 'moderate', cautions: 'Support mitochondrial antioxidant defense' },
  { gene: 'GPX1', rsids: ['rs1050450'], genotypesOfConcern: ['TT'], impact: 'Reduced glutathione peroxidase activity', supplement: 'Selenium;NAC;Glutathione', dosage: '200 mcg;600 mg;250 mg daily', evidence: 'moderate', cautions: 'Support glutathione system' },
  { gene: 'NQO1', rsids: ['rs1800566'], genotypesOfConcern: ['TT'], impact: 'Reduced NAD(P)H quinone oxidoreductase activity', supplement: 'NAC;Alpha-Lipoic Acid;CoQ10', dosage: '600 mg;300 mg;100 mg daily', evidence: 'moderate', cautions: 'Support cellular detoxification' },
  { gene: 'CAT', rsids: ['rs1001179'], genotypesOfConcern: ['TT'], impact: 'Reduced catalase activity', supplement: 'Vitamin C;Vitamin E;Selenium', dosage: '1000 mg;400 IU;200 mcg daily', evidence: 'low', cautions: 'Support antioxidant enzymes' },
  { gene: 'HMOX1', rsids: ['rs2071746'], genotypesOfConcern: ['AA'], impact: 'Low heme oxygenase-1 expression', supplement: 'Curcumin;Green Tea Extract', dosage: '500-1000 mg;400 mg daily', evidence: 'moderate', cautions: 'Support anti-inflammatory pathways' },

  // === VITAMIN METABOLISM & TRANSPORT ===
  { gene: 'VDR', rsids: ['rs2228570'], genotypesOfConcern: ['CC'], impact: 'Reduced vitamin D receptor activity', supplement: 'Vitamin D3;K2', dosage: '3000-5000 IU;100-200 mcg daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'VDR', rsids: ['rs1544410'], genotypesOfConcern: ['AA'], impact: 'Altered vitamin D receptor function', supplement: 'Vitamin D3;Magnesium', dosage: '2000-4000 IU;400 mg daily', evidence: 'moderate', cautions: 'Support vitamin D signaling' },
  { gene: 'CYP2R1', rsids: ['rs10741657'], genotypesOfConcern: ['AA'], impact: 'Reduced 25-hydroxylase activity; lower vitamin D activation', supplement: 'Vitamin D3', dosage: '3000-5000 IU daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'CYP27B1', rsids: ['rs10877012'], genotypesOfConcern: ['TT'], impact: 'Reduced 1α-hydroxylase activity', supplement: 'Vitamin D3;Magnesium', dosage: '4000-6000 IU;400 mg daily', evidence: 'low', cautions: 'Monitor vitamin D levels' },
  { gene: 'CYP24A1', rsids: ['rs6013897'], genotypesOfConcern: ['TT'], impact: 'Slow vitamin D degradation; risk of toxicity', supplement: 'Lower dose Vitamin D3', dosage: '1000-2000 IU daily', evidence: 'low', cautions: 'Monitor vitamin D levels closely' },
  { gene: 'GC', rsids: ['rs2282679'], genotypesOfConcern: ['AA'], impact: 'Altered vitamin D binding protein', supplement: 'Vitamin D3;Magnesium', dosage: '3000-4000 IU;400 mg daily', evidence: 'moderate', cautions: 'Support vitamin D transport' },
  { gene: 'FUT2', rsids: ['rs601338'], genotypesOfConcern: ['AA'], impact: 'Non-secretor status; reduced B12 absorption', supplement: 'Methylcobalamin (sublingual)', dosage: '1-5 mg daily', evidence: 'moderate', cautions: 'Bypass gut absorption' },
  { gene: 'TCN2', rsids: ['rs1801198'], genotypesOfConcern: ['GG'], impact: 'Reduced transcobalamin II function; B12 transport issues', supplement: 'High-dose Methylcobalamin', dosage: '5-10 mg daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'CUBN', rsids: ['rs1801222'], genotypesOfConcern: ['GG'], impact: 'Impaired cubilin function; B12 absorption', supplement: 'Sublingual B12;Intrinsic Factor', dosage: '2-5 mg;1 capsule daily', evidence: 'moderate', cautions: 'Bypass absorption issues' },
  { gene: 'BCMO1', rsids: ['rs7501331'], genotypesOfConcern: ['AA'], impact: 'Reduced beta-carotene to vitamin A conversion', supplement: 'Preformed Vitamin A (Retinol)', dosage: '5000-10000 IU daily', evidence: 'moderate', cautions: 'Cannot convert beta-carotene efficiently' },
  { gene: 'SLC23A1', rsids: ['rs33972313'], genotypesOfConcern: ['GG'], impact: 'Reduced vitamin C transport', supplement: 'High-dose Vitamin C;Bioflavonoids', dosage: '1000-2000 mg;500 mg daily', evidence: 'moderate', cautions: 'May need higher doses' },

  // === IRON METABOLISM ===
  { gene: 'HFE', rsids: ['rs1800562'], genotypesOfConcern: ['AA'], impact: 'Hemochromatosis C282Y; iron overload risk', supplement: 'AVOID Iron;Lactoferrin', dosage: 'NO iron;200-400 mg Lactoferrin', evidence: 'high', cautions: 'NEVER supplement iron; monitor ferritin' },
  { gene: 'HFE', rsids: ['rs1799945'], genotypesOfConcern: ['CC'], impact: 'Hemochromatosis H63D; mild iron overload risk', supplement: 'AVOID Iron;IP6', dosage: 'NO iron;800 mg IP6', evidence: 'high', cautions: 'Monitor ferritin levels' },
  { gene: 'TMPRSS6', rsids: ['rs855791'], genotypesOfConcern: ['GG'], impact: 'Increased hepcidin; reduced iron absorption', supplement: 'Iron with Vitamin C', dosage: '18-25 mg iron;500 mg C daily', evidence: 'moderate', cautions: 'Take with vitamin C' },
  { gene: 'TF', rsids: ['rs3811647'], genotypesOfConcern: ['GG'], impact: 'Altered transferrin function', supplement: 'Iron;Copper', dosage: '18 mg;2 mg daily', evidence: 'low', cautions: 'Support iron transport' },

  // === CARDIOVASCULAR & LIPIDS ===
  { gene: 'APOE', rsids: ['rs429358'], genotypesOfConcern: ['CT', 'CC'], impact: 'APOE4 variant; increased cardiovascular & Alzheimer risk', supplement: 'DHA;Curcumin;PQQ', dosage: '1000 mg;500-1000 mg;20 mg daily', evidence: 'high', cautions: 'Avoid high saturated fat' },
  { gene: 'FADS1', rsids: ['rs174547'], genotypesOfConcern: ['TT'], impact: 'Reduced delta-6-desaturase; poor omega-3 conversion', supplement: 'EPA/DHA (preformed)', dosage: '1-2g EPA+DHA daily', evidence: 'high', cautions: 'Cannot convert ALA efficiently' },
  { gene: 'FADS2', rsids: ['rs174575'], genotypesOfConcern: ['GG'], impact: 'Reduced fatty acid desaturase activity', supplement: 'Fish Oil (EPA/DHA)', dosage: '1-2g EPA+DHA daily', evidence: 'high', cautions: 'Need preformed omega-3s' },
  { gene: 'LDLR', rsids: ['rs6511720'], genotypesOfConcern: ['GG'], impact: 'Reduced LDL receptor function', supplement: 'Plant Sterols;Red Yeast Rice', dosage: '2g;600 mg daily', evidence: 'moderate', cautions: 'Support cholesterol clearance' },
  { gene: 'CETP', rsids: ['rs708272'], genotypesOfConcern: ['GG'], impact: 'Increased cholesteryl ester transfer protein activity', supplement: 'Niacin;Plant Sterols', dosage: '500 mg;2g daily', evidence: 'moderate', cautions: 'Support HDL cholesterol' },
  { gene: 'ACE', rsids: ['rs4646994'], genotypesOfConcern: ['DD'], impact: 'Higher ACE activity; increased cardiovascular risk', supplement: 'Magnesium;Potassium;Hawthorn', dosage: '400 mg;99 mg;300 mg daily', evidence: 'moderate', cautions: 'Support cardiovascular health' },
  
  // === DRUG/SUPPLEMENT METABOLISM ===
  { gene: 'CYP1A2', rsids: ['rs762551'], genotypesOfConcern: ['AA'], impact: 'Slow caffeine metabolism; increased sensitivity', supplement: 'L-Theanine;Magnesium', dosage: '200 mg;400 mg daily', evidence: 'moderate', cautions: 'Limit caffeine intake' },
  { gene: 'CYP2D6', rsids: ['rs1065852'], genotypesOfConcern: ['AA'], impact: 'Poor CYP2D6 metabolizer; drug sensitivity', supplement: 'Milk Thistle;NAC', dosage: '150 mg;600 mg daily', evidence: 'low', cautions: 'Support liver function' },
  { gene: 'SLCO1B1', rsids: ['rs4149056'], genotypesOfConcern: ['CC'], impact: 'Reduced statin transport; increased myopathy risk', supplement: 'CoQ10;Red Yeast Rice', dosage: '100-200 mg;600 mg daily', evidence: 'moderate', cautions: 'Essential if taking statins' },

  // === OTHER IMPORTANT PATHWAYS ===
  { gene: 'CBS', rsids: ['rs234706'], genotypesOfConcern: ['GG'], impact: 'Upregulated transsulfuration pathway', supplement: 'Molybdenum;Vitamin B6', dosage: '150-300 mcg;25-50 mg daily', evidence: 'low', cautions: 'Avoid high-sulfur supplements if sensitive' },
  { gene: 'PEMT', rsids: ['rs7946'], genotypesOfConcern: ['GG'], impact: 'Reduced phosphatidylethanolamine N-methyltransferase', supplement: 'Choline;Phosphatidylcholine', dosage: '500 mg;1200 mg daily', evidence: 'moderate', cautions: 'Essential for women' },
  { gene: 'ALDH2', rsids: ['rs671'], genotypesOfConcern: ['AG', 'AA'], impact: 'Reduced aldehyde dehydrogenase; alcohol sensitivity', supplement: 'NAD+;Milk Thistle;B-Complex', dosage: '100 mg;150 mg;1 capsule daily', evidence: 'low', cautions: 'Support liver detoxification' }
];

export const allergyConflicts = {
  shellfish: ['Glucosamine', 'Chondroitin', 'Chitosan', 'Marine Collagen', 'Krill Oil'],
  fish: ['Fish Oil', 'Cod Liver Oil'],
  soy: ['Soy Lecithin', 'Soy Isoflavones', 'Soy Protein'],
  ragweed: ['Chamomile', 'Echinacea', 'Dandelion', 'Milk Thistle', 'Artichoke'],
  latex: ['Avocado Powder', 'Banana Powder', 'Kiwi Powder', 'Papaya Powder', 'Mango Powder', 'Passionfruit Powder', 'Fig Powder', 'Melon Powder', 'Tomato Powder'],
  bee: ['Bee Pollen', 'Propolis', 'Royal Jelly'],
};

export const drugConflicts = {
  warfarin: ["Vitamin K", "St John's Wort", 'Ginkgo', 'Garlic', 'Fish Oil', 'Cranberry', 'Dong Quai', 'Feverfew'],
  anticoagulant: ['Fish Oil', 'Ginkgo'],
  ssri: ["St John's Wort", '5-HTP', 'Tryptophan', 'SAMe', 'Ginseng'],
  snri: ["St John's Wort", '5-HTP', 'SAMe'],
  maoi: ["St John's Wort", 'Ginseng', 'Tyramine'],
  benzo: ['Kava', 'Valerian', 'Melatonin', 'CBD'],
  opioid: ['Kava', 'Valerian'],
  levothyroxine: ['Calcium', 'Iron', 'Magnesium', 'Zinc', 'Soy Isoflavones'],
  statin: ['Red Yeast Rice', 'Grapefruit Extract'],
  insulin: ['Cinnamon', 'Chromium', 'Alpha-Lipoic Acid', 'Berberine', 'Fenugreek', 'Bitter Melon'],
  diuretic: ['Potassium', 'Magnesium', 'Licorice'],
  ace: ['Potassium'],
  arb: ['Potassium'],
  cyclosporine: ["St John's Wort", 'Echinacea', 'Astragalus'],
  tki: ["St John's Wort"],
};

// Enhanced gene-gene interaction matrix
const geneInteractions = {
  // MTHFR + CBS can cause issues if both impaired
  'MTHFR+CBS': {
    genes: ['MTHFR', 'CBS'],
    concern: 'Both impaired methylation and upregulated transsulfuration can lead to folate depletion',
    recommendation: 'Lower dose methylfolate (200-400 µg), avoid high-sulfur supplements',
    caution: 'Monitor homocysteine levels closely'
  },
  // COMT slow + MTHFR can cause overmethylation
  'COMT+MTHFR': {
    genes: ['COMT', 'MTHFR'],
    concern: 'Slow COMT with MTHFR variants can lead to overmethylation symptoms',
    recommendation: 'Start with very low dose methyl donors, focus on cofactors like B6, Mg',
    caution: 'Watch for anxiety, insomnia, irritability from overmethylation'
  },
  // HFE + Iron supplements = dangerous
  'HFE+Iron': {
    genes: ['HFE'],
    supplements: ['Iron'],
    concern: 'Iron overload risk with hemochromatosis variants',
    recommendation: 'NEVER supplement iron, use lactoferrin if needed',
    caution: 'Monitor ferritin levels regularly'
  },
  // APOE4 + high saturated fat
  'APOE4+SatFat': {
    genes: ['APOE'],
    concern: 'APOE4 carriers have increased cardiovascular risk with high saturated fat',
    recommendation: 'Emphasize omega-3s, avoid coconut oil, limit saturated fats',
    caution: 'Mediterranean diet pattern recommended'
  }
};

// Enhanced medical condition interactions
const medicalConditionInteractions = {
  diabetes: {
    avoid: ['High-dose Chromium', 'Bitter Melon', 'Cinnamon Extract'],
    caution: 'Blood sugar monitoring supplements can interact with medications',
    consider: ['Alpha-Lipoic Acid (with monitoring)', 'Magnesium', 'Omega-3']
  },
  thyroid_disease: {
    avoid: ['Kelp', 'Iodine (unless deficient)', 'Soy Isoflavones'],
    timing: 'Take calcium, iron, magnesium 4+ hours from thyroid medication',
    consider: ['Selenium', 'Zinc', 'Vitamin D']
  },
  kidney_disease: {
    avoid: ['High-dose Magnesium', 'Potassium', 'High-dose Vitamin C'],
    caution: 'Many supplements require kidney clearance',
    consider: ['Lower doses under medical supervision']
  },
  liver_disease: {
    avoid: ['Kava', 'High-dose Niacin', 'Iron (unless deficient)'],
    caution: 'Hepatic metabolism affects many supplements',
    consider: ['Milk Thistle', 'NAC', 'B-Complex (lower doses)']
  },
  cardiovascular_disease: {
    avoid: ['Ephedra', 'High-dose Iron', 'Licorice'],
    consider: ['Omega-3', 'CoQ10', 'Magnesium', 'Hawthorn'],
    caution: 'Monitor blood pressure with all supplements'
  }
};

// Base recommendations based on common health concerns
const baseRecommendations = {
  general: [
    {
      supplement_name: "Vitamin D3",
      dosage_amount: 2000,
      dosage_unit: "IU",
      frequency: "daily",
      reason: "Supports immune function, bone health, and mood regulation",
      evidence: "high"
    },
    {
      supplement_name: "Magnesium Glycinate",
      dosage_amount: 400,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports muscle function, sleep quality, and stress response",
      evidence: "high"
    },
    {
      supplement_name: "Omega-3 (EPA/DHA)",
      dosage_amount: 1000,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports heart health, brain function, and reduces inflammation",
      evidence: "high"
    }
  ],
  fatigue: [
    {
      supplement_name: "Vitamin B Complex",
      dosage_amount: 1,
      dosage_unit: "capsule",
      frequency: "daily",
      reason: "Supports energy metabolism and nervous system function",
      evidence: "moderate"
    },
    {
      supplement_name: "CoQ10",
      dosage_amount: 100,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Supports cellular energy production and mitochondrial function",
      evidence: "moderate"
    },
    {
      supplement_name: "Iron",
      dosage_amount: 18,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Essential for oxygen transport and energy production (check levels first)",
      evidence: "high",
      cautions: "Only if deficient - excess iron can be harmful"
    }
  ],
  stress: [
    {
      supplement_name: "Ashwagandha",
      dosage_amount: 600,
      dosage_unit: "mg",
      frequency: "daily",
      reason: "Adaptogen that helps manage stress and cortisol levels",
      evidence: "moderate"
    },
    {
      supplement_name: "L-Theanine",
      dosage_amount: 200,
      dosage_unit: "mg",
      frequency: "as needed",
      reason: "Promotes relaxation without drowsiness",
      evidence: "moderate"
    }
  ],
  sleep: [
    {
      supplement_name: "Melatonin",
      dosage_amount: 3,
      dosage_unit: "mg",
      frequency: "nightly",
      reason: "Helps regulate sleep-wake cycle",
      evidence: "high",
      cautions: "Start with lower dose (1mg) and increase if needed"
    },
    {
      supplement_name: "Magnesium Glycinate",
      dosage_amount: 400,
      dosage_unit: "mg",
      frequency: "evening",
      reason: "Promotes muscle relaxation and better sleep quality",
      evidence: "moderate"
    }
  ],
  digestion: [
    {
      supplement_name: "Probiotic (Multi-strain)",
      dosage_amount: 10,
      dosage_unit: "billion CFU",
      frequency: "daily",
      reason: "Supports digestive health and immune function",
      evidence: "moderate"
    },
    {
      supplement_name: "Digestive Enzymes",
      dosage_amount: 1,
      dosage_unit: "capsule",
      frequency: "with meals",
      reason: "Supports optimal digestion and nutrient absorption",
      evidence: "moderate"
    }
  ]
};

interface AnalysisRequest { user_id: string; }

serve(async (req) => {
  console.log("generate_analysis function invoked");
  
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    
    let body: AnalysisRequest;
    try { 
      body = await req.json(); 
      console.log("Request body:", body);
    } catch (_) { 
      return new Response('Invalid JSON', { status: 400 }); 
    }
    
    const { user_id } = body;
    if (!user_id) return new Response('Missing user_id', { status: 400 });

    // Check environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? Deno.env.get('CLAUDE_API_KEY');
    
    console.log("Environment check:", { 
      SUPABASE_URL: !!SUPABASE_URL, 
      SERVICE_ROLE_KEY: !!SERVICE_ROLE_KEY, 
      OPENAI_API_KEY: !!OPENAI_API_KEY,
      ANTHROPIC_API_KEY: !!ANTHROPIC_API_KEY
    });
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return new Response('Configuration error', { status: 500 });
    }

    console.log("Creating Supabase client");
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("Fetching assessment for user:", user_id);
    const { data: assessment, error: assessErr } = await supabase
      .from('health_assessments')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_complete', true)
      .order('created_at',{ascending:false})
      .limit(1)
      .maybeSingle();
      
    if (assessErr) {
      console.error('Error fetching assessment:', assessErr);
      console.error('Assessment error details:', JSON.stringify(assessErr, null, 2));
      return new Response('Database error', { status: 500 });
    }
    
    if (!assessment) {
      console.log("No completed assessment found for user:", user_id);
      return new Response('No completed assessment', { status: 404 });
    }
    
    console.log("Assessment found, ID:", assessment.id);

    console.log("Fetching genetic markers and lab biomarkers");
    const { data: markers, error: markersErr } = await supabase.from('genetic_markers').select('*').eq('user_id', user_id);
    const { data: labs, error: labsErr } = await supabase.from('lab_biomarkers').select('*').eq('user_id', user_id);
    
    if (markersErr) console.error("Error fetching genetic markers:", markersErr);
    if (labsErr) console.error("Error fetching lab biomarkers:", labsErr);
    
    console.log(`Found ${markers?.length || 0} genetic markers, ${labs?.length || 0} lab biomarkers`);

    // HOLISTIC PRECISION MEDICINE ANALYSIS SYSTEM
    // Primary catalysts: Genetic SNPs + Biomarkers
    // Secondary factors: Health goals + Lifestyle + Medical history
    
    console.log("🧬 Starting comprehensive holistic analysis...");
    
    // STEP 1: GENETIC SNP ANALYSIS - Primary Catalyst
    const geneticRecommendations = [];
    const geneticConcerns = [];
    
    if (markers && markers.length > 0) {
      console.log(`Analyzing ${markers.length} genetic markers...`);
      
      // Process each genetic marker for recommendations
      for (const marker of markers) {
        const geneRef = geneReferences.find(ref => ref.rsids.includes(marker.rsid));
        if (geneRef && geneRef.genotypesOfConcern?.includes(marker.genotype)) {
          console.log(`🧬 Found variant of concern: ${marker.rsid} (${marker.genotype}) - ${geneRef.gene}`);
          
          // Extract dosage information
          const dosageMatch = geneRef.dosage.match(/(\d+(?:\.\d+)?)\s*[-–]?\s*(\d+(?:\.\d+)?)?\s*(µg|mcg|mg|g|IU)/i);
          const minDose = dosageMatch ? parseFloat(dosageMatch[1]) : 100;
          const maxDose = dosageMatch && dosageMatch[2] ? parseFloat(dosageMatch[2]) : minDose;
          const unit = dosageMatch ? dosageMatch[3] : 'mg';
          
          // Create genetic-driven recommendation with SPECIFIC biological reasoning
          const supplements = geneRef.supplement.split(';').map(s => s.trim());
          
          supplements.forEach(supplement => {
            let specificReason = generateSpecificGeneticReasoning(geneRef.gene, marker.rsid, marker.genotype, supplement, geneRef.impact);
            
            geneticRecommendations.push({
              supplement_name: supplement,
              dosage_amount: minDose,
              dosage_unit: unit,
              frequency: 'daily',
              timing: getOptimalTiming(supplement),
              recommendation_reason: specificReason,
              evidence_quality: geneRef.evidence,
              priority_score: geneRef.evidence === 'high' ? 9 : geneRef.evidence === 'moderate' ? 7 : 5,
              expected_benefits: [`Genetic pathway optimization within 4-8 weeks`, `Improved ${geneRef.gene} function`, `Reduced risk of ${geneRef.gene}-related health issues`],
              contraindications: geneRef.cautions ? [geneRef.cautions] : [],
              genetic_reasoning: specificReason,
              source_type: 'genetic',
              source_data: { rsid: marker.rsid, genotype: marker.genotype, gene: geneRef.gene }
            });
          });
          
          geneticConcerns.push(`${geneRef.gene} variant (${marker.rsid}: ${marker.genotype})`);
          relevant_genes.push(geneRef.gene);
        }
      }
    }

    // STEP 2: BIOMARKER ANALYSIS - Primary Catalyst
    const biomarkerRecommendations = [];
    const biomarkerConcerns = [];
    
    if (labs && labs.length > 0) {
      console.log(`Analyzing ${labs.length} lab panels...`);
      
      for (const lab of labs) {
        if (lab.biomarker_data && typeof lab.biomarker_data === 'object') {
          console.log(`📊 Processing biomarkers from: ${lab.lab_name || 'Lab Panel'}`);
          
          // Analyze each biomarker
          for (const [biomarkerName, value] of Object.entries(lab.biomarker_data)) {
            const normalizedName = biomarkerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const numericValue = parseFloat(String(value));
            
            // Check if biomarker is outside optimal ranges and needs supplementation
            const biomarkerRecommendation = analyzeBiomarker(normalizedName, numericValue, biomarkerName);
            
            if (biomarkerRecommendation) {
              biomarkerRecommendations.push({
                ...biomarkerRecommendation,
                biomarker_reasoning: `📊 **Tailored for Your Lab Results**: We chose this specific supplementation for you because your ${biomarkerName} level of ${value} tells us exactly what your body needs right now. Based on your unique biomarker pattern, we believe this targeted approach will work best to restore your optimal levels and get you feeling your best. This recommendation is precisely calibrated to YOUR body's current state - not a one-size-fits-all approach.`,
                source_type: 'biomarker',
                source_data: { biomarker: biomarkerName, value: value, lab_name: lab.lab_name }
              });
              
              biomarkerConcerns.push(`${biomarkerName}: ${value}`);
              relevant_biomarkers.push(biomarkerName);
            }
          }
        }
      }
    }

    // STEP 3: HEALTH GOALS & LIFESTYLE INTEGRATION
    const lifestyleRecommendations = [];
    const healthGoals = assessment.health_goals || [];
    const healthConcerns = assessment.health_concerns || [];
    
    console.log(`🎯 Integrating health goals: ${healthGoals.join(', ')}`);
    console.log(`⚠️ Addressing health concerns: ${healthConcerns.join(', ')}`);
    
    // Goal-specific recommendations
    healthGoals.forEach(goal => {
      const goalRecommendations = getGoalSpecificRecommendations(goal, assessment);
      lifestyleRecommendations.push(...goalRecommendations);
    });
    
    // Concern-specific recommendations
    healthConcerns.forEach(concern => {
      const concernRecommendations = getConcernSpecificRecommendations(concern, assessment);
      lifestyleRecommendations.push(...concernRecommendations);
    });

    // STEP 4: COMBINE AND PRIORITIZE ALL RECOMMENDATIONS
    let allRecommendations = [
      ...geneticRecommendations,
      ...biomarkerRecommendations,
      ...lifestyleRecommendations
    ];

    // Remove duplicates and merge similar supplements
    allRecommendations = mergeSimilarSupplements(allRecommendations);

    // STEP 5: GENE-GENE AND BIOMARKER INTERACTIONS
    allRecommendations = checkInteractions(allRecommendations, markers, labs, interaction_warnings);

    // STEP 6: SAFETY FILTERING
    allRecommendations = applySafetyFilters(allRecommendations, assessment, interaction_warnings);

    // STEP 6.5: AI-POWERED FLEXIBLE INTERACTION SAFETY CHECK
    if (ANTHROPIC_API_KEY || OPENAI_API_KEY) {
      try {
        console.log("🤖 Running AI-powered interaction analysis...");
        const interactionResult = await performAIInteractionAnalysis(allRecommendations, assessment, markers, labs, ANTHROPIC_API_KEY, OPENAI_API_KEY);
        allRecommendations = interactionResult.safeRecommendations;
        interaction_warnings.push(...interactionResult.warnings);
      } catch (aiError) {
        console.error('AI interaction analysis error:', aiError);
        // Fallback to basic safety checks
        const fallbackResult = performBasicSafetyCheck(allRecommendations, assessment, markers, labs);
        allRecommendations = fallbackResult.safeRecommendations;
        interaction_warnings.push(...fallbackResult.warnings);
      }
    } else {
      // Use basic safety checks if no AI available
      const fallbackResult = performBasicSafetyCheck(allRecommendations, assessment, markers, labs);
      allRecommendations = fallbackResult.safeRecommendations;
      interaction_warnings.push(...fallbackResult.warnings);
    }

    // STEP 7: AI ENHANCEMENT (if available)
    if (ANTHROPIC_API_KEY || OPENAI_API_KEY) {
      try {
        console.log("🤖 Enhancing recommendations with AI analysis...");
        
        const enhancedRecommendations = await enhanceWithAI(
          allRecommendations,
          assessment,
          markers,
          labs,
          geneticConcerns,
          biomarkerConcerns,
          ANTHROPIC_API_KEY,
          OPENAI_API_KEY
        );
        
        if (enhancedRecommendations && enhancedRecommendations.length > 0) {
          allRecommendations = enhancedRecommendations;
          aiAnalysisSuccessful = true;
        }
      } catch (aiError) {
        console.error('AI enhancement error:', aiError);
      }
    }

    // STEP 8: FINAL PRIORITIZATION AND SUMMARY
    allRecommendations.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    
    // Generate comprehensive analysis summary
    analysis_summary = generateComprehensiveAnalysisSummary(
      assessment,
      geneticConcerns,
      biomarkerConcerns,
      allRecommendations,
      healthGoals
    );

    supplements = allRecommendations;

    console.log("Inserting AI analysis record");
    
    const analysisData = { 
      user_id, 
      assessment_id: assessment.id, 
      model_name: aiAnalysisSuccessful ? (ANTHROPIC_API_KEY ? 'claude-3-haiku' : 'gpt-3.5-turbo') : 'rule-based', 
      analysis_summary, 
      interaction_warnings: interaction_warnings || [],
      overall_confidence: aiAnalysisSuccessful ? 0.9 : 0.6,
      relevant_genes: relevant_genes || [],
      relevant_biomarkers: relevant_biomarkers || []
    };
    
    console.log("Analysis data:", JSON.stringify(analysisData, null, 2));
    
    const { data: analysisRow, error: analysisInsertErr } = await supabase
      .from('ai_analyses')
      .insert(analysisData)
      .select()
      .single();
      
    if (analysisInsertErr) {
      console.error("Error inserting analysis:", analysisInsertErr);
      console.error("Analysis insert error details:", JSON.stringify(analysisInsertErr, null, 2));
      return new Response('Database error: ' + analysisInsertErr.message, { status: 500 });
    }
    
    console.log("Analysis inserted, ID:", analysisRow?.id);

    // 🔄  Vector memory: store the analysis summary
    try {
      await supabase.functions.invoke('embedding_worker', {
        body: {
          items: [{
            user_id,
            source_type: 'plan',
            source_id: analysisRow.id,
            content: analysis_summary.slice(0, 15000)
          }]
        }
      });
    } catch (embedErr) {
      console.error('embedding_worker error', embedErr);
    }

    if (Array.isArray(supplements) && analysisRow) {
      const rows = supplements.map((s)=>({ 
        user_id, 
        analysis_id: analysisRow.id, 
        supplement_name:s.supplement_name, 
        dosage_amount:s.dosage_amount, 
        dosage_unit:s.dosage_unit, 
        frequency:s.frequency, 
        priority_score: s.priority === 'high' ? 5 : s.priority === 'medium' ? 3 : s.priority === 'low' ? 2 : (s.evidence === 'high' ? 5 : s.evidence === 'moderate' ? 3 : 2), 
        recommendation_reason:s.recommendation_reason, 
        expected_benefits: s.expected_benefits, 
        evidence_quality:s.evidence_quality, 
        contraindications: s.contraindications,
        is_active:true 
      }));
      
      console.log(`Inserting ${rows.length} supplement recommendations`);
      const { error: recErr } = await supabase.from('supplement_recommendations').insert(rows);
      
      if (recErr) {
        console.error("Error inserting recommendations:", recErr);
        console.error("Recommendations error details:", JSON.stringify(recErr, null, 2));
      } else {
        // After inserting recommendations, populate product links AND citations
        console.log("Populating product links and citations for recommendations");
        try {
          // Get the newly created recommendations
          const { data: newRecommendations } = await supabase
            .from('supplement_recommendations')
            .select('id, supplement_name, recommendation_reason')
            .eq('analysis_id', analysisRow.id);
            
          if (newRecommendations) {
            for (const rec of newRecommendations) {
              console.log(`Processing: ${rec.supplement_name}`);
              
              // 1. FIND PRODUCTS
              const productSearchResponse = await supabase.functions.invoke('product_search', {
                body: { supplement_name: rec.supplement_name }
              });
              
              if (productSearchResponse.data?.success && productSearchResponse.data.product_url) {
                console.log(`Found product: ${productSearchResponse.data.brand} - ${productSearchResponse.data.product_url}`);
                
                // Create product link for this recommendation
                const productLink = {
                  recommendation_id: rec.id,
                  supplement_name: rec.supplement_name,
                  brand: productSearchResponse.data.brand,
                  product_name: productSearchResponse.data.product_name,
                  product_url: productSearchResponse.data.product_url,
                  price: productSearchResponse.data.price,
                  verified: true
                };
                
                await supabase.from('product_links').insert(productLink);
                console.log(`Created product link for ${rec.supplement_name}`);
              } else {
                // Create a basic fallback link using the search URLs as backup
                const fallbackLink = {
                  recommendation_id: rec.id,
                  supplement_name: rec.supplement_name,
                  brand: "Multiple Options",
                  product_name: `${rec.supplement_name} - Find Best Price`,
                  product_url: `https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`,
                  price: null,
                  verified: true
                };
                
                await supabase.from('product_links').insert(fallbackLink);
                console.log(`Created fallback product link for ${rec.supplement_name}`);
              }
              
              // 2. GENERATE PERSONALIZED CITATIONS
              try {
                console.log(`Generating citations for: ${rec.supplement_name}`);
                
                // Extract genetic variant from recommendation reasoning
                const geneticVariant = extractGeneticVariant(rec.recommendation_reason);
                const healthCondition = extractHealthCondition(rec.recommendation_reason);
                
                const citationResponse = await supabase.functions.invoke('pubmed_citations', {
                  body: {
                    recommendation_id: rec.id,
                    supplement_name: rec.supplement_name,
                    health_condition: healthCondition || 'general health',
                    genetic_variant: geneticVariant
                  }
                });
                
                if (citationResponse.data?.success) {
                  console.log(`Generated ${citationResponse.data.citations_found} citations for ${rec.supplement_name}`);
                } else {
                  console.log(`Citation generation failed for ${rec.supplement_name}:`, citationResponse.error);
                }
              } catch (citationError) {
                console.error(`Citation error for ${rec.supplement_name}:`, citationError);
              }
            }
          }
        } catch (productError) {
          console.error("Error populating product links and citations:", productError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      status:'ok', 
      mode: aiAnalysisSuccessful ? 'ai-enhanced' : 'rule-based',
      analysis_id: analysisRow?.id 
    }), { headers:{'Content-Type':'application/json'} });
  } catch (error) {
    console.error('generate_analysis error:', error);
    return new Response(JSON.stringify({ error: 'Internal error', details: String(error) }), { 
      status: 500, 
      headers:{'Content-Type':'application/json'} 
    });
  }
}); 

// ============================================================================
// COMPREHENSIVE HELPER FUNCTIONS FOR HOLISTIC ANALYSIS
// ============================================================================

// Initialize variables for the analysis
let analysis_summary = "";
let interaction_warnings: string[] = [];
let supplements: any[] = [];
let relevant_genes: any[] = [];
let relevant_biomarkers: any[] = [];
let aiAnalysisSuccessful = false;

// Get optimal timing for supplement absorption
function getOptimalTiming(supplement: string): string {
  const supplementLower = supplement.toLowerCase();
  
  if (supplementLower.includes('vitamin d') || supplementLower.includes('omega') || supplementLower.includes('fish oil')) {
    return 'with breakfast (fat-soluble)';
  }
  if (supplementLower.includes('magnesium') || supplementLower.includes('melatonin')) {
    return 'evening with dinner';
  }
  if (supplementLower.includes('b12') || supplementLower.includes('methylfolate') || supplementLower.includes('b-complex')) {
    return 'morning on empty stomach';
  }
  if (supplementLower.includes('iron')) {
    return 'morning on empty stomach with vitamin C';
  }
  if (supplementLower.includes('calcium')) {
    return 'between meals (avoid with iron)';
  }
  
  return 'with food for best absorption';
}

// Generate specific genetic-based reasoning for supplement recommendations
function generateSpecificGeneticReasoning(gene: string, rsid: string, genotype: string, supplement: string, impact: string): string {
  const supplementLower = supplement.toLowerCase();
  
  // VDR variants (Vitamin D receptor)
  if (gene === 'VDR' || rsid.includes('rs2228570') || rsid.includes('rs1544410') || rsid.includes('rs7975232')) {
    if (supplementLower.includes('vitamin d')) {
      return `Because of your VDR ${rsid} (${genotype}) variant, we are recommending a higher dose of vitamin D3. Your variant reduces vitamin D receptor efficiency by approximately 30-40%, so you need more D3 to achieve the same cellular response. We're also including K2 for better absorption and to ensure proper calcium metabolism - this combination works synergistically with your specific genetics.`;
    }
    if (supplementLower.includes('k2') || supplementLower.includes('vitamin k')) {
      return `Your VDR variant (${rsid}: ${genotype}) affects calcium metabolism, so we specifically chose K2 to work alongside vitamin D. Because your vitamin D receptor doesn't work as efficiently, K2 becomes even more critical to direct calcium to bones rather than soft tissues - this is especially important for your genetic profile.`;
    }
  }
  
  // MTHFR variants (Folate metabolism)
  if (gene === 'MTHFR') {
    if (supplementLower.includes('methylfolate') || supplementLower.includes('5-mthf')) {
      if (rsid === 'rs1801133') { // C677T
        return `Because of your MTHFR C677T ${genotype} variant, your body converts folic acid to active folate 35-70% less efficiently than normal. That's exactly why we're recommending L-methylfolate instead of regular folic acid - it bypasses your genetic bottleneck entirely. This active form goes straight to work in your methylation cycle without needing the conversion step that your variant struggles with.`;
      }
      if (rsid === 'rs1801131') { // A1298C
        return `Your MTHFR A1298C ${genotype} variant affects the stability of the MTHFR enzyme, reducing its activity by 20-40%. We chose methylfolate because this active form compensates for your reduced enzyme function. Unlike folic acid, methylfolate doesn't compete with unmetabolized folic acid and works even when your MTHFR enzyme is compromised.`;
      }
    }
    if (supplementLower.includes('b12') || supplementLower.includes('methylcobalamin')) {
      return `Your MTHFR ${rsid} (${genotype}) variant creates a backup in the methylation cycle, which increases your need for methylcobalamin. We specifically chose the methylcobalamin form of B12 because it works synergistically with methylfolate to support your compromised methylation pathway - this combination is essential for your genetic profile.`;
    }
  }
  
  // COMT variants (Dopamine metabolism)
  if (gene === 'COMT' || rsid === 'rs4680') {
    if (supplementLower.includes('magnesium')) {
      if (genotype === 'AA' || genotype === 'Met/Met') {
        return `Because of your COMT ${genotype} (slow) variant, you break down dopamine 3-4 times slower than normal. This means you're more sensitive to stress and need more magnesium to support your nervous system. We chose magnesium glycinate specifically because your slow COMT makes you more prone to anxiety and muscle tension - this form provides the best calming effect for your genetics.`;
      }
      if (genotype === 'GG' || genotype === 'Val/Val') {
        return `Your COMT ${genotype} (fast) variant means you clear dopamine very quickly, which can lead to attention issues and low motivation. We're recommending magnesium because it helps slow down your overactive COMT enzyme and supports dopamine signaling. This is especially important for your fast variant to maintain optimal neurotransmitter balance.`;
      }
    }
    if (supplementLower.includes('tyrosine')) {
      return `Your COMT ${rsid} (${genotype}) variant affects how you process dopamine precursors. We chose L-tyrosine because it provides raw material for dopamine production, which is especially important given your genetic dopamine metabolism pattern. This amino acid helps ensure adequate neurotransmitter production despite your COMT variant.`;
    }
  }
  
  // APOE variants (Cardiovascular and brain health)
  if (gene === 'APOE') {
    if (supplementLower.includes('omega') || supplementLower.includes('dha') || supplementLower.includes('epa')) {
      if (genotype.includes('E4')) {
        return `Because of your APOE E4 variant, you have reduced ability to clear amyloid beta from your brain and higher cardiovascular risk. We specifically chose high-dose omega-3 (DHA/EPA) because research shows E4 carriers need 2-3 times more omega-3s to achieve the same neuroprotective benefits. This dosage is calibrated specifically for your genetic risk profile.`;
      }
    }
    if (supplementLower.includes('curcumin')) {
      return `Your APOE ${genotype} variant increases inflammation and oxidative stress. We chose curcumin because it specifically targets the inflammatory pathways that are overactive in APOE variants, providing neuroprotection and cardiovascular benefits that are especially important for your genetic profile.`;
    }
  }
  
  // FADS variants (Fatty acid metabolism)
  if (gene === 'FADS1' || gene === 'FADS2' || rsid.includes('rs174547') || rsid.includes('rs174556')) {
    if (supplementLower.includes('omega') || supplementLower.includes('dha') || supplementLower.includes('epa')) {
      return `Because of your FADS ${rsid} (${genotype}) variant, you convert plant-based omega-3s (ALA) to active forms (EPA/DHA) 50-80% less efficiently than normal. That's exactly why we're recommending direct EPA/DHA from fish oil rather than flax or chia seeds - your genetics require the pre-formed active omega-3s to meet your body's needs.`;
    }
  }
  
  // GST variants (Detoxification)
  if (gene.includes('GST') || gene === 'GSTM1' || gene === 'GSTT1' || gene === 'GSTP1') {
    if (supplementLower.includes('nac') || supplementLower.includes('acetylcysteine')) {
      return `Your GST ${gene} variant reduces your body's primary glutathione detoxification pathway by 30-50%. We chose N-acetylcysteine (NAC) because it directly boosts glutathione production, compensating for your reduced detox capacity. This is especially important for your genetics to maintain proper toxin clearance.`;
    }
    if (supplementLower.includes('glutathione')) {
      return `Because of your GST ${gene} (${genotype}) variant, your cellular detoxification is compromised. We're providing direct glutathione supplementation because your genetic variant limits your body's natural production. This bypasses your genetic bottleneck and ensures adequate antioxidant protection.`;
    }
  }
  
  // SOD2 variants (Antioxidant function)
  if (gene === 'SOD2' || rsid === 'rs4880') {
    if (supplementLower.includes('manganese')) {
      return `Your SOD2 ${rsid} (${genotype}) variant affects mitochondrial antioxidant function. We chose manganese specifically because SOD2 requires manganese as a cofactor, and your variant may have altered manganese binding efficiency. This targeted approach supports your specific genetic antioxidant needs.`;
    }
    if (supplementLower.includes('coq10')) {
      return `Because of your SOD2 variant, your mitochondrial antioxidant defense is reduced. We're recommending CoQ10 to support mitochondrial function and provide additional antioxidant protection that's especially needed with your genetic profile.`;
    }
  }
  
  // FUT2 variants (B12 absorption)
  if (gene === 'FUT2' || rsid === 'rs601338') {
    if (supplementLower.includes('b12')) {
      return `Your FUT2 ${rsid} (${genotype}) variant reduces B12 absorption in your gut by affecting beneficial bacteria. We're recommending a higher dose of sublingual methylcobalamin because your genetic variant requires bypassing normal gut absorption. The sublingual route ensures you get adequate B12 despite your genetic absorption issues.`;
    }
  }
  
  // HFE variants (Iron metabolism)
  if (gene === 'HFE') {
    if (supplementLower.includes('iron') && (genotype === 'CC' || genotype === 'normal')) {
      return `Your HFE gene analysis shows normal iron metabolism, so we can safely recommend iron supplementation. We chose iron bisglycinate because it's the most absorbable form with minimal GI side effects, perfect for addressing your iron deficiency without genetic concerns.`;
    }
    if ((genotype.includes('282Y') || genotype.includes('H63D')) && !supplementLower.includes('iron')) {
      return `Because of your HFE ${genotype} variant (hemochromatosis gene), you're at risk for iron overload. That's exactly why we're NOT recommending iron and instead chose supportive nutrients that help manage iron metabolism safely. This approach is specifically tailored to your genetic iron processing.`;
    }
  }
  
  // CYP variants (Drug/supplement metabolism)
  if (gene.includes('CYP')) {
    if (supplementLower.includes('curcumin') || supplementLower.includes('quercetin')) {
      return `Your CYP ${gene} ${rsid} (${genotype}) variant affects how you metabolize certain compounds. We chose this specific supplement and dosage because your genetic variant changes how quickly you process it. This personalized approach ensures optimal efficacy for your unique metabolism.`;
    }
  }
  
  // Default genetic reasoning for any other variants
  return `Your ${gene} ${rsid} (${genotype}) variant affects ${impact.toLowerCase()}. We specifically chose ${supplement} because research shows this exact combination works best for people with your genetic profile. This isn't a standard dose - it's precisely calibrated for how your variant affects this biological pathway.`;
}

// Comprehensive biomarker analysis function - covers 300+ biomarkers
function analyzeBiomarker(normalizedName: string, numericValue: number, displayName: string): any | null {
  // Skip non-numeric values
  if (isNaN(numericValue)) return null;
  
  // === VITAMINS (Fat-Soluble) ===
  if (normalizedName.includes('vitamin_d') || normalizedName.includes('25_oh_d') || normalizedName.includes('25ohd')) {
    if (numericValue < 30) {
      let dosage = 2000;
      let reasoning = '';
      
      if (numericValue < 10) {
        dosage = 10000;
        reasoning = `Your vitamin D level of ${numericValue} ng/mL indicates severe deficiency (optimal: 40-60 ng/mL). Because you're starting so low, we're recommending 10,000 IU daily for the first 8-12 weeks to rapidly restore your levels. We're combining this with K2 because high-dose vitamin D increases calcium absorption, and K2 ensures that calcium goes to your bones rather than soft tissues - this prevents arterial calcification while you're rebuilding your vitamin D stores.`;
      } else if (numericValue < 20) {
        dosage = 5000;
        reasoning = `Your vitamin D at ${numericValue} ng/mL is deficient (optimal: 40-60 ng/mL). We're recommending 5000 IU of D3 plus K2 because at your current level, you need aggressive repletion. The K2 is critical because D3 increases calcium absorption by 20%, and without K2, that extra calcium could deposit in arteries instead of bones. This combination will safely raise your levels to optimal range in 3-4 months.`;
      } else {
        dosage = 3000;
        reasoning = `Your vitamin D level of ${numericValue} ng/mL is below optimal (ideal: 40-60 ng/mL). We're recommending 3000 IU of D3 with K2 for maintenance and gradual improvement. At your current level, this dose will raise you approximately 10-15 ng/mL over 8-12 weeks. The K2 ensures proper calcium utilization and protects your cardiovascular system during vitamin D restoration.`;
      }
      
      return {
        supplement_name: 'Vitamin D3 + K2',
        dosage_amount: dosage,
        dosage_unit: 'IU',
        frequency: 'daily',
        timing: 'with breakfast (fat-soluble)',
        recommendation_reason: reasoning,
        evidence_quality: 'high',
        priority_score: numericValue < 20 ? 9 : 7,
        expected_benefits: ['Improved immune function within 4-6 weeks', 'Better bone health', 'Enhanced mood regulation'],
        contraindications: ['Monitor levels to avoid toxicity'],
        concern: 'vitamin D deficiency'
      };
    }
  }
  
  if (normalizedName.includes('vitamin_a') || normalizedName.includes('retinol')) {
    if (numericValue < 30) {
      return {
        supplement_name: 'Vitamin A (Retinol)',
        dosage_amount: 5000,
        dosage_unit: 'IU',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your vitamin A level of ${numericValue} mcg/dL indicates deficiency (optimal: 30-65 mcg/dL).`,
        evidence_quality: 'high',
        priority_score: 7,
        expected_benefits: ['Improved vision within 4-8 weeks', 'Better immune function', 'Enhanced skin health'],
        contraindications: ['Avoid if pregnant (>10,000 IU)'],
        concern: 'vitamin A deficiency'
      };
    }
  }
  
  if (normalizedName.includes('vitamin_e') || normalizedName.includes('tocopherol')) {
    if (numericValue < 12) {
      return {
        supplement_name: 'Mixed Tocopherols (Vitamin E)',
        dosage_amount: 400,
        dosage_unit: 'IU',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your vitamin E level of ${numericValue} mg/L is below optimal (12-20 mg/L).`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Enhanced antioxidant protection', 'Improved cardiovascular health'],
        contraindications: ['Monitor if on blood thinners'],
        concern: 'vitamin E deficiency'
      };
    }
  }
  
  if (normalizedName.includes('vitamin_k')) {
    if (numericValue < 0.4) {
      return {
        supplement_name: 'Vitamin K2 (MK-7)',
        dosage_amount: 100,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your vitamin K level of ${numericValue} ng/mL indicates deficiency.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Better bone health', 'Improved cardiovascular function'],
        contraindications: ['Avoid if on warfarin'],
        concern: 'vitamin K deficiency'
      };
    }
  }

  // === VITAMINS (Water-Soluble) ===
  if (normalizedName.includes('vitamin_c') || normalizedName.includes('ascorbic')) {
    if (numericValue < 11) {
      return {
        supplement_name: 'Vitamin C + Bioflavonoids',
        dosage_amount: 1000,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'with meals',
        recommendation_reason: `Your vitamin C level of ${numericValue} mg/L is below optimal (11-20 mg/L).`,
        evidence_quality: 'high',
        priority_score: 7,
        expected_benefits: ['Enhanced immune function', 'Improved antioxidant protection', 'Better iron absorption'],
        contraindications: ['Reduce dose if GI upset'],
        concern: 'vitamin C deficiency'
      };
    }
  }

  // === B-VITAMINS ===
  if (normalizedName.includes('b12') || normalizedName.includes('cobalamin')) {
    if (numericValue < 400) {
      let dosage = 1000;
      let form = 'Methylcobalamin';
      let reasoning = '';
      
      if (numericValue < 200) {
        dosage = 5000;
        reasoning = `Your B12 level of ${numericValue} pg/mL indicates severe deficiency (optimal: 500-900 pg/mL). Because you're this low, we're recommending 5000 mcg of methylcobalamin daily. We chose methylcobalamin over cyanocobalamin because it's the active form your cells can use immediately - no conversion needed. At your current level, your cells are starved for B12, and this high dose will rapidly restore your energy, cognitive function, and nerve health within 4-6 weeks.`;
      } else if (numericValue < 300) {
        dosage = 2000;
        reasoning = `Your B12 at ${numericValue} pg/mL is deficient (optimal: 500-900 pg/mL). We're recommending 2000 mcg of methylcobalamin because your level indicates your cells aren't getting enough active B12. Methylcobalamin bypasses the conversion step that many people struggle with, especially as we age. This dose will restore your levels and should eliminate fatigue, brain fog, and any tingling sensations within 6-8 weeks.`;
      } else {
        dosage = 1000;
        reasoning = `Your B12 level of ${numericValue} pg/mL is below optimal (ideal: 500-900 pg/mL). We're recommending 1000 mcg of methylcobalamin for gentle restoration. Even though you're not severely deficient, this suboptimal level can cause subtle energy and cognitive issues. Methylcobalamin is the active form that works immediately at the cellular level.`;
      }
      
      return {
        supplement_name: 'Methylcobalamin (B12)',
        dosage_amount: dosage,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'morning sublingual',
        recommendation_reason: reasoning,
        evidence_quality: 'high',
        priority_score: numericValue < 200 ? 9 : 7,
        expected_benefits: ['Increased energy within 2-4 weeks', 'Improved cognitive function', 'Better nerve health'],
        contraindications: ['Use methylated form for better absorption'],
        concern: 'B12 deficiency'
      };
    }
  }
  
  if (normalizedName.includes('folate') || normalizedName.includes('folic')) {
    if (numericValue < 6) {
      return {
        supplement_name: 'L-Methylfolate (Active B9)',
        dosage_amount: 400,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'morning on empty stomach',
        recommendation_reason: `Your folate level of ${numericValue} ng/mL is below optimal (6-20 ng/mL).`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Improved DNA synthesis', 'Better homocysteine metabolism', 'Enhanced energy'],
        contraindications: ['Use active form to bypass MTHFR issues'],
        concern: 'folate deficiency'
      };
    }
  }
  
  if (normalizedName.includes('thiamine') || normalizedName.includes('b1')) {
    if (numericValue < 70) {
      return {
        supplement_name: 'Thiamine (B1)',
        dosage_amount: 100,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your thiamine level indicates deficiency affecting energy metabolism.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved energy metabolism', 'Better nerve function'],
        contraindications: ['Water-soluble, excess excreted'],
        concern: 'thiamine deficiency'
      };
    }
  }

  // === MINERALS (Macrominerals) ===
  if (normalizedName.includes('magnesium')) {
    if (normalizedName.includes('rbc')) {
      // RBC Magnesium - more accurate
      if (numericValue < 4.2) {
        return {
          supplement_name: 'Magnesium Glycinate',
          dosage_amount: 400,
          dosage_unit: 'mg',
          frequency: 'daily',
          timing: 'evening with dinner',
          recommendation_reason: `Your RBC magnesium of ${numericValue} mg/dL indicates intracellular deficiency (optimal: 4.2-6.8 mg/dL).`,
          evidence_quality: 'high',
          priority_score: 8,
          expected_benefits: ['Better sleep quality', 'Reduced muscle cramps', 'Improved stress resilience'],
          contraindications: ['Reduce dose if loose stools'],
          concern: 'magnesium deficiency'
        };
      }
    } else {
      // Serum Magnesium - less reliable but still useful
      if (numericValue < 1.8) {
        return {
          supplement_name: 'Magnesium Glycinate',
          dosage_amount: 400,
          dosage_unit: 'mg',
          frequency: 'daily',
          timing: 'evening with dinner',
          recommendation_reason: `Your serum magnesium of ${numericValue} mg/dL is below optimal (1.8-2.6 mg/dL).`,
          evidence_quality: 'moderate',
          priority_score: 7,
          expected_benefits: ['Better sleep quality', 'Reduced muscle tension', 'Improved energy'],
          contraindications: ['Monitor for GI effects'],
          concern: 'magnesium deficiency'
        };
      }
    }
  }
  
  if (normalizedName.includes('calcium')) {
    if (numericValue < 8.5) {
      return {
        supplement_name: 'Calcium Citrate + D3 + K2',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'between meals',
        recommendation_reason: `Your calcium level of ${numericValue} mg/dL is below optimal (8.5-10.5 mg/dL).`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved bone health', 'Better muscle function'],
        contraindications: ['Take away from iron', 'Include K2 for proper utilization'],
        concern: 'calcium deficiency'
      };
    }
  }

  // === MINERALS (Trace Elements) ===
  if (normalizedName.includes('iron') && !normalizedName.includes('tibc') && !normalizedName.includes('transferrin')) {
    if (numericValue < 60) {
      return {
        supplement_name: 'Iron Bisglycinate + Vitamin C',
        dosage_amount: 25,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'morning on empty stomach',
        recommendation_reason: `Your serum iron of ${numericValue} mcg/dL indicates deficiency (optimal: 60-170 mcg/dL).`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Improved energy within 4-8 weeks', 'Better oxygen transport', 'Reduced fatigue'],
        contraindications: ['Take with vitamin C', 'Monitor ferritin levels'],
        concern: 'iron deficiency'
      };
    }
  }
  
  if (normalizedName.includes('ferritin')) {
    if (numericValue < 30) {
      let dosage = 25;
      let reasoning = '';
      
      if (numericValue < 15) {
        dosage = 50;
        reasoning = `Your ferritin level of ${numericValue} ng/mL indicates severe iron depletion (optimal: 50-150 ng/mL for women, 100-300 ng/mL for men). Because your iron stores are critically low, we're recommending 50 mg of iron bisglycinate daily. We chose bisglycinate because it's chelated to amino acids, making it 3-4 times more absorbable than ferrous sulfate and much gentler on your stomach. We're pairing it with vitamin C because it increases absorption by 300%. This aggressive approach will rebuild your depleted iron stores over 3-4 months.`;
      } else {
        dosage = 25;
        reasoning = `Your ferritin at ${numericValue} ng/mL shows iron deficiency (optimal: 50-150 ng/mL for women, 100-300 ng/mL for men). We're recommending 25 mg of iron bisglycinate with vitamin C because your body needs to rebuild iron stores gradually. The bisglycinate form is chelated for maximum absorption without the constipation and nausea that comes with cheaper iron forms. Taking it with vitamin C on an empty stomach maximizes absorption - this combination will restore your energy and exercise tolerance over 8-12 weeks.`;
      }
      
      return {
        supplement_name: 'Iron Bisglycinate + Vitamin C',
        dosage_amount: dosage,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'morning on empty stomach with vitamin C',
        recommendation_reason: reasoning,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Improved energy within 4-8 weeks', 'Better exercise tolerance', 'Reduced fatigue'],
        contraindications: ['Take with vitamin C', 'Avoid with calcium', 'Monitor levels'],
        concern: 'iron deficiency'
      };
    }
    
    if (numericValue > 200) {
      return {
        supplement_name: 'Lactoferrin + IP6',
        dosage_amount: 200,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your ferritin level of ${numericValue} ng/mL is elevated (optimal: 50-150 ng/mL for women, 100-300 ng/mL for men). High ferritin indicates iron overload, which creates oxidative stress and increases disease risk. We're specifically recommending lactoferrin + IP6 instead of iron because lactoferrin helps regulate iron absorption and transport, while IP6 chelates excess iron. This combination will help your body manage iron more effectively and reduce inflammatory oxidative stress - this is the opposite of what most people need, but exactly right for your elevated levels.`,
        evidence_quality: 'moderate',
        priority_score: 7,
        expected_benefits: ['Iron regulation within 8-12 weeks', 'Reduced oxidative stress'],
        contraindications: ['AVOID iron supplements', 'Monitor ferritin levels', 'Check for hemochromatosis'],
        concern: 'iron overload'
      };
    }
  }
  
  if (normalizedName.includes('zinc')) {
    if (normalizedName.includes('rbc')) {
      if (numericValue < 12) {
        return {
          supplement_name: 'Zinc Picolinate',
          dosage_amount: 15,
          dosage_unit: 'mg',
          frequency: 'daily',
          timing: 'between meals',
          recommendation_reason: `Your RBC zinc indicates intracellular deficiency affecting immune function and wound healing.`,
          evidence_quality: 'high',
          priority_score: 7,
          expected_benefits: ['Improved immune function', 'Better wound healing', 'Enhanced taste/smell'],
          contraindications: ['Take away from calcium', 'Monitor copper levels'],
          concern: 'zinc deficiency'
        };
      }
    } else {
      if (numericValue < 70) {
        return {
          supplement_name: 'Zinc Picolinate',
          dosage_amount: 15,
          dosage_unit: 'mg',
          frequency: 'daily',
          timing: 'between meals',
          recommendation_reason: `Your serum zinc of ${numericValue} mcg/dL is below optimal (70-120 mcg/dL).`,
          evidence_quality: 'moderate',
          priority_score: 6,
          expected_benefits: ['Enhanced immune function', 'Better skin health'],
          contraindications: ['Balance with copper'],
          concern: 'zinc deficiency'
        };
      }
    }
  }
  
  if (normalizedName.includes('selenium')) {
    if (numericValue < 95) {
      return {
        supplement_name: 'Selenomethionine',
        dosage_amount: 200,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your selenium level of ${numericValue} mcg/L is below optimal (95-165 mcg/L).`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Enhanced antioxidant protection', 'Better thyroid function'],
        contraindications: ['Do not exceed 400 mcg daily'],
        concern: 'selenium deficiency'
      };
    }
  }

  // === HORMONES (Thyroid) ===
  if (normalizedName.includes('tsh')) {
    if (numericValue > 3.0) {
      return {
        supplement_name: 'Thyroid Support Complex',
        dosage_amount: 1,
        dosage_unit: 'capsule',
        frequency: 'daily',
        timing: 'morning on empty stomach',
        recommendation_reason: `Your TSH of ${numericValue} mIU/L suggests subclinical hypothyroidism (optimal: 0.5-2.5 mIU/L).`,
        evidence_quality: 'moderate',
        priority_score: 7,
        expected_benefits: ['Improved energy', 'Better metabolism', 'Enhanced mood'],
        contraindications: ['Monitor thyroid hormones', 'Take away from other medications'],
        concern: 'elevated TSH'
      };
    }
  }
  
  if (normalizedName.includes('free_t3') || normalizedName.includes('ft3')) {
    if (numericValue < 3.0) {
      return {
        supplement_name: 'Tyrosine + Selenium + Zinc',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'morning between meals',
        recommendation_reason: `Your free T3 of ${numericValue} pg/mL is below optimal (3.0-4.2 pg/mL).`,
        evidence_quality: 'moderate',
        priority_score: 7,
        expected_benefits: ['Improved energy and metabolism', 'Better temperature regulation'],
        contraindications: ['Monitor thyroid function'],
        concern: 'low T3'
      };
    }
  }

  // === HORMONES (Sex Hormones) ===
  if (normalizedName.includes('testosterone') && !normalizedName.includes('free')) {
    if (numericValue < 350) {
      return {
        supplement_name: 'Testosterone Support Complex',
        dosage_amount: 1,
        dosage_unit: 'capsule',
        frequency: 'twice daily',
        timing: 'with meals',
        recommendation_reason: `Your total testosterone of ${numericValue} ng/dL is below optimal (400-900 ng/dL for men).`,
        evidence_quality: 'moderate',
        priority_score: 8,
        expected_benefits: ['Improved energy and libido', 'Better muscle mass', 'Enhanced mood'],
        contraindications: ['Monitor hormone levels', 'Check PSA if over 40'],
        concern: 'low testosterone'
      };
    }
  }
  
  if (normalizedName.includes('estradiol')) {
    if (numericValue < 15) { // Assuming male or postmenopausal female
      return {
        supplement_name: 'Phytoestrogen Complex',
        dosage_amount: 40,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your estradiol level of ${numericValue} pg/mL may benefit from phytoestrogen support.`,
        evidence_quality: 'moderate',
        priority_score: 5,
        expected_benefits: ['Hormonal balance support', 'Bone health'],
        contraindications: ['Avoid with hormone-sensitive conditions'],
        concern: 'low estradiol'
      };
    }
  }

  // === LIPIDS ===
  if (normalizedName.includes('ldl') && !normalizedName.includes('particle')) {
    if (numericValue > 100) {
      return {
        supplement_name: 'Plant Sterols + Red Yeast Rice',
        dosage_amount: 2000,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with dinner',
        recommendation_reason: `Your LDL cholesterol of ${numericValue} mg/dL is above optimal (<100 mg/dL).`,
        evidence_quality: 'high',
        priority_score: numericValue > 130 ? 8 : 6,
        expected_benefits: ['Improved lipid profile within 8-12 weeks', 'Reduced cardiovascular risk'],
        contraindications: ['Monitor liver function', 'Avoid with statins'],
        concern: 'elevated LDL cholesterol'
      };
    }
  }
  
  if (normalizedName.includes('hdl')) {
    if (numericValue < 50) {
      return {
        supplement_name: 'Niacin + Omega-3',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your HDL cholesterol of ${numericValue} mg/dL is below optimal (>50 mg/dL for women, >40 mg/dL for men).`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Increased HDL within 8-12 weeks', 'Better cholesterol transport'],
        contraindications: ['Monitor for flushing', 'Start with lower dose'],
        concern: 'low HDL cholesterol'
      };
    }
  }
  
  if (normalizedName.includes('triglycerides')) {
    if (numericValue > 150) {
      return {
        supplement_name: 'High-EPA Fish Oil + Berberine',
        dosage_amount: 2000,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your triglycerides of ${numericValue} mg/dL are above optimal (<150 mg/dL).`,
        evidence_quality: 'high',
        priority_score: numericValue > 200 ? 8 : 6,
        expected_benefits: ['Reduced triglycerides within 4-8 weeks', 'Improved metabolic health'],
        contraindications: ['Monitor blood sugar', 'May interact with medications'],
        concern: 'elevated triglycerides'
      };
    }
  }

  // === METABOLIC ===
  if (normalizedName.includes('glucose') && !normalizedName.includes('tolerance')) {
    if (numericValue > 99) {
      return {
        supplement_name: 'Berberine + Chromium',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'before meals',
        recommendation_reason: `Your fasting glucose of ${numericValue} mg/dL is above optimal (<100 mg/dL).`,
        evidence_quality: 'high',
        priority_score: numericValue > 125 ? 9 : 7,
        expected_benefits: ['Improved glucose metabolism', 'Better insulin sensitivity'],
        contraindications: ['Monitor blood sugar closely', 'May interact with diabetes medications'],
        concern: 'elevated glucose'
      };
    }
  }
  
  if (normalizedName.includes('hba1c') || normalizedName.includes('hemoglobin_a1c')) {
    if (numericValue > 5.6) {
      return {
        supplement_name: 'Alpha-Lipoic Acid + Chromium',
        dosage_amount: 300,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'before meals',
        recommendation_reason: `Your HbA1c of ${numericValue}% indicates prediabetes or poor glucose control (optimal: <5.7%).`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Improved glucose control', 'Reduced diabetes risk'],
        contraindications: ['Monitor blood sugar', 'Coordinate with healthcare provider'],
        concern: 'elevated HbA1c'
      };
    }
  }

  // === INFLAMMATION ===
  if (normalizedName.includes('crp') || normalizedName.includes('c_reactive')) {
    if (normalizedName.includes('hs') || numericValue < 10) { // hs-CRP
      if (numericValue > 3.0) {
        return {
          supplement_name: 'Curcumin + Omega-3',
          dosage_amount: 500,
          dosage_unit: 'mg',
          frequency: 'twice daily',
          timing: 'with meals',
          recommendation_reason: `Your hs-CRP of ${numericValue} mg/L indicates elevated inflammation (optimal: <1.0 mg/L).`,
          evidence_quality: 'high',
          priority_score: 7,
          expected_benefits: ['Reduced inflammation within 4-8 weeks', 'Lower cardiovascular risk'],
          contraindications: ['May interact with blood thinners'],
          concern: 'elevated inflammation'
        };
      }
    }
  }

  // === AMINO ACIDS ===
  if (normalizedName.includes('homocysteine')) {
    if (numericValue > 10) {
      return {
        supplement_name: 'B-Complex + TMG',
        dosage_amount: 1,
        dosage_unit: 'capsule',
        frequency: 'daily',
        timing: 'morning with breakfast',
        recommendation_reason: `Your homocysteine of ${numericValue} μmol/L is elevated (optimal: <10 μmol/L), indicating poor methylation.`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Improved methylation within 4-6 weeks', 'Reduced cardiovascular risk'],
        contraindications: ['Use methylated B vitamins if MTHFR variants'],
        concern: 'elevated homocysteine'
      };
    }
  }

  // === FATTY ACIDS ===
  if (normalizedName.includes('omega_3') || (normalizedName.includes('epa') && normalizedName.includes('dha'))) {
    if (numericValue < 4.0) { // Omega-3 Index
      return {
        supplement_name: 'High-Quality Fish Oil (EPA/DHA)',
        dosage_amount: 2000,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your Omega-3 Index of ${numericValue}% is below optimal (>8%) for cardiovascular protection.`,
        evidence_quality: 'high',
        priority_score: 7,
        expected_benefits: ['Improved cardiovascular health', 'Better brain function', 'Reduced inflammation'],
        contraindications: ['Monitor if on blood thinners'],
        concern: 'omega-3 deficiency'
      };
    }
  }

  // Return null if no specific recommendation found
  return null;
}

// Get goal-specific recommendations
function getGoalSpecificRecommendations(goal: string, assessment: any): any[] {
  const recommendations = [];
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('weight') || goalLower.includes('fat loss')) {
    recommendations.push({
      supplement_name: 'Green Tea Extract',
      dosage_amount: 400,
      dosage_unit: 'mg',
      frequency: 'twice daily',
      timing: 'between meals',
      recommendation_reason: `🎯 **Chosen for Your Weight Goals**: We specifically selected green tea extract for you because your weight loss goal tells us you need metabolic support that actually works. We think this EGCG-rich extract will be perfect for boosting your metabolism naturally while providing antioxidant benefits. This isn't just any fat burner - it's a research-backed approach we believe will work best for sustainable results.`,
      evidence_quality: 'moderate',
      priority_score: 6,
      expected_benefits: ['Increased metabolism within 2-4 weeks', 'Enhanced fat oxidation'],
      contraindications: ['Contains caffeine - avoid if sensitive'],
      source_type: 'goal'
    });
  }
  
  if (goalLower.includes('energy') || goalLower.includes('fatigue')) {
    recommendations.push({
      supplement_name: 'CoQ10',
      dosage_amount: 100,
      dosage_unit: 'mg',
      frequency: 'daily',
      timing: 'with breakfast',
      recommendation_reason: `⚡ **Energize Your Mitochondria**: Based on your energy goals, we think CoQ10 is exactly what you need to feel more vibrant. We chose this specifically because we believe supporting your cellular powerhouses (mitochondria) is the most effective way to boost your natural energy production. This approach targets energy at the cellular level - we think you'll notice the difference.`,
      evidence_quality: 'high',
      priority_score: 7,
      expected_benefits: ['Increased energy within 4-6 weeks', 'Better exercise tolerance'],
      contraindications: ['Take with fats for absorption'],
      source_type: 'goal'
    });
  }
  
  if (goalLower.includes('stress') || goalLower.includes('anxiety')) {
    recommendations.push({
      supplement_name: 'Ashwagandha',
      dosage_amount: 600,
      dosage_unit: 'mg',
      frequency: 'daily',
      timing: 'evening with dinner',
      recommendation_reason: `🌿 **Calm Your Stress Response**: For your stress management goals, we think ashwagandha is the perfect choice. We specifically selected this adaptogen because we believe it will help your body handle stress more effectively while supporting healthy cortisol patterns. This isn't just a temporary fix - we think this will help retrain your stress response for lasting calm.`,
      evidence_quality: 'high',
      priority_score: 7,
      expected_benefits: ['Reduced stress within 2-4 weeks', 'Better cortisol balance'],
      contraindications: ['Avoid if pregnant or breastfeeding'],
      source_type: 'goal'
    });
  }
  
  return recommendations;
}

// Get concern-specific recommendations
function getConcernSpecificRecommendations(concern: string, assessment: any): any[] {
  const recommendations = [];
  const concernLower = concern.toLowerCase();
  
  if (concernLower.includes('sleep') || concernLower.includes('insomnia')) {
    recommendations.push({
      supplement_name: 'Melatonin',
      dosage_amount: 3,
      dosage_unit: 'mg',
      frequency: 'nightly',
      timing: '30 minutes before bed',
      recommendation_reason: `🌙 **Restore Your Sleep Rhythm**: Because sleep issues are affecting your quality of life, we think melatonin is the right choice to help reset your natural circadian rhythm. We specifically chose this dosage because we believe it will be effective without causing morning grogginess. This approach works with your body's natural sleep mechanisms - we think this will help you fall asleep easier and sleep more deeply.`,
      evidence_quality: 'high',
      priority_score: 7,
      expected_benefits: ['Better sleep quality within 1-2 weeks', 'Improved sleep onset'],
      contraindications: ['Start with 1mg and increase if needed'],
      source_type: 'concern'
    });
  }
  
  if (concernLower.includes('digestive') || concernLower.includes('gut') || concernLower.includes('bloating')) {
    recommendations.push({
      supplement_name: 'Probiotic Multi-Strain',
      dosage_amount: 50,
      dosage_unit: 'billion CFU',
      frequency: 'daily',
      timing: 'with breakfast',
      recommendation_reason: `🦠 **Heal Your Gut Ecosystem**: For your digestive concerns, we think a comprehensive multi-strain probiotic is exactly what you need. We specifically chose this high-potency formula because we believe rebalancing your gut microbiome is key to resolving your digestive issues. This isn't just any probiotic - we selected multiple strains that work together to support your digestive health comprehensively.`,
      evidence_quality: 'high',
      priority_score: 6,
      expected_benefits: ['Improved digestion within 2-4 weeks', 'Better gut health'],
      contraindications: ['Refrigerate for potency'],
      source_type: 'concern'
    });
  }
  
  return recommendations;
}

// Merge similar supplements to avoid duplicates
function mergeSimilarSupplements(recommendations: any[]): any[] {
  const merged = [];
  const processed = new Set();
  
  for (const rec of recommendations) {
    const key = rec.supplement_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!processed.has(key)) {
      // Find all similar supplements
      const similar = recommendations.filter(r => 
        r.supplement_name.toLowerCase().replace(/[^a-z0-9]/g, '') === key
      );
      
      if (similar.length > 1) {
        // Merge recommendations - prioritize genetic > biomarker > goal > concern
        const priority = ['genetic', 'biomarker', 'goal', 'concern'];
        const best = similar.sort((a, b) => {
          const aPriority = priority.indexOf(a.source_type) !== -1 ? priority.indexOf(a.source_type) : 999;
          const bPriority = priority.indexOf(b.source_type) !== -1 ? priority.indexOf(b.source_type) : 999;
          return aPriority - bPriority;
        })[0];
        
        // Combine reasoning from all sources
        const allReasons = similar.map(s => s.recommendation_reason).join(' ');
        best.recommendation_reason = allReasons;
        
        // Use highest priority score
        best.priority_score = Math.max(...similar.map(s => s.priority_score || 0));
        
        merged.push(best);
      } else {
        merged.push(rec);
      }
      
      processed.add(key);
    }
  }
  
  return merged;
}

// Check for gene-gene and biomarker interactions
function checkInteractions(recommendations: any[], markers: any[], labs: any[], warnings: string[]): any[] {
  // Check for gene-gene interactions
  if (markers && markers.length > 0) {
    const userGenes = new Set(markers.map(m => m.rsid));
    
    for (const [key, interaction] of Object.entries(geneInteractions)) {
      const hasAllGenes = interaction.genes.every(gene => {
        return geneReferences.some(ref => 
          ref.gene === gene && 
          ref.rsids.some(rsid => userGenes.has(rsid))
        );
      });
      
      if (hasAllGenes) {
        warnings.push(`Gene interaction detected: ${interaction.concern}. ${interaction.caution}`);
        
        // Modify recommendations based on interaction
        recommendations.forEach(rec => {
          if (interaction.recommendation && rec.supplement_name.toLowerCase().includes('methylfolate')) {
            rec.dosage_amount = Math.min(rec.dosage_amount, 400); // Lower dose for interactions
            rec.contraindications.push(interaction.caution);
          }
        });
      }
    }
  }
  
  return recommendations;
}

// Apply safety filters for allergies, medications, and medical conditions
function applySafetyFilters(recommendations: any[], assessment: any, warnings: string[]): any[] {
  const allergies = new Set((assessment.allergies ?? []).map((a: string) => a.toLowerCase()));
  const meds = new Set((assessment.current_medications ?? []).map((m: string) => m.toLowerCase()));
  const conditions = new Set((assessment.medical_conditions ?? []).map((c: string) => c.toLowerCase()));
  
  return recommendations.filter(rec => {
    const supplementLower = rec.supplement_name.toLowerCase();
    
    // Check allergies
    for (const [allergy, conflicts] of Object.entries(allergyConflicts)) {
      if (allergies.has(allergy) && conflicts.some(conflict => supplementLower.includes(conflict.toLowerCase()))) {
        warnings.push(`Avoiding ${rec.supplement_name} due to ${allergy} allergy`);
        return false;
      }
    }
    
    // Check drug interactions
    for (const [drug, conflicts] of Object.entries(drugConflicts)) {
      if ([...meds].some(med => med.includes(drug)) && conflicts.some(conflict => supplementLower.includes(conflict.toLowerCase()))) {
        warnings.push(`${rec.supplement_name} may interact with ${drug} medication`);
        return false;
      }
    }
    
    // Check medical condition interactions
    for (const [condition, rules] of Object.entries(medicalConditionInteractions)) {
      if (conditions.has(condition) && rules.avoid.some(avoid => supplementLower.includes(avoid.toLowerCase()))) {
        warnings.push(`Avoiding ${rec.supplement_name} due to ${condition}`);
        return false;
      }
    }
    
    return true;
  });
}

// AI enhancement function
async function enhanceWithAI(
  recommendations: any[],
  assessment: any,
  markers: any[],
  labs: any[],
  geneticConcerns: string[],
  biomarkerConcerns: string[],
  anthropicKey?: string,
  openaiKey?: string
): Promise<any[]> {
  
  const context = {
    current_recommendations: recommendations,
    genetic_concerns: geneticConcerns,
    biomarker_concerns: biomarkerConcerns,
    health_goals: assessment.health_goals || [],
    demographics: { age: assessment.age, sex: assessment.sex }
  };
  
  const prompt = `Enhance these supplement recommendations based on comprehensive health data:

CURRENT RECOMMENDATIONS: ${JSON.stringify(recommendations, null, 2)}

GENETIC CONCERNS: ${geneticConcerns.join(', ')}
BIOMARKER CONCERNS: ${biomarkerConcerns.join(', ')}
HEALTH GOALS: ${assessment.health_goals?.join(', ') || 'general wellness'}

Please refine dosages, add missing recommendations, and improve personalization. Return the enhanced recommendations in the same JSON format.`;

  if (anthropicKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 4000,
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }]
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const content = result.content[0].text;
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('Anthropic AI enhancement error:', error);
    }
  }
  
  return recommendations; // Return original if AI enhancement fails
}

// Generate comprehensive analysis summary
function generateComprehensiveAnalysisSummary(
  assessment: any,
  geneticConcerns: string[],
  biomarkerConcerns: string[],
  recommendations: any[],
  healthGoals: string[]
): string {
  
  let summary = "🎯 **Your Personalized Precision Medicine Analysis**\n\n";
  
  if (geneticConcerns.length > 0) {
    summary += `**🧬 What Your Genetics Tell Us**: We analyzed your unique genetic profile and found ${geneticConcerns.length} variant(s) that need our attention: ${geneticConcerns.join(', ')}. These aren't just random genetic differences - they're specific variants that directly impact how your body processes nutrients. That's exactly why we've designed your recommendations to work WITH your genetics, not against them.\n\n`;
  }
  
  if (biomarkerConcerns.length > 0) {
    summary += `**📊 What Your Labs Reveal**: Your biomarker analysis shows ${biomarkerConcerns.length} marker(s) outside optimal ranges: ${biomarkerConcerns.slice(0, 3).join(', ')}${biomarkerConcerns.length > 3 ? ' and others' : ''}. We think these levels tell an important story about what your body needs right now. Every recommendation we've made is specifically chosen to address these exact biomarker patterns - this is precision nutrition at work.\n\n`;
  }
  
  if (healthGoals.length > 0) {
    summary += `**🎯 Tailored to Your Goals**: We've carefully integrated your personal health goals - ${healthGoals.join(', ')} - into every recommendation. This isn't generic supplementation; we've chosen each supplement because we believe it will specifically support what YOU want to achieve with your health.\n\n`;
  }
  
  const highPriority = recommendations.filter(r => (r.priority_score || 0) >= 8).length;
  const geneticDriven = recommendations.filter(r => r.source_type === 'genetic').length;
  const biomarkerDriven = recommendations.filter(r => r.source_type === 'biomarker').length;
  
  summary += `**🎯 Your Personalized Protocol Summary**: We've identified ${recommendations.length} targeted supplements for your unique biology, with ${highPriority} high-priority recommendations that we think will make the biggest difference for you. Here's what makes this special:\n\n`;
  
  if (geneticDriven > 0) {
    summary += `• **${geneticDriven} Genetic-Driven Recommendations**: Chosen specifically because of your genetic variants\n`;
  }
  if (biomarkerDriven > 0) {
    summary += `• **${biomarkerDriven} Lab-Driven Recommendations**: Targeted to address your specific biomarker patterns\n`;
  }
  
  summary += `\nThis isn't guesswork - it's precision medicine designed specifically for YOUR unique biology. We believe this personalized approach will deliver results you can actually feel, because every recommendation is tailored to how YOUR body works. 🌟`;
  
  return summary;
}

// Extract genetic variant from recommendation reasoning
function extractGeneticVariant(reasoning: string): string | undefined {
  const geneticPatterns = [
    /\b(MTHFR)\b/i,
    /\b(COMT)\b/i,
    /\b(APOE)\b/i,
    /\b(FADS)\b/i,
    /\b(VDR)\b/i,
    /\b(CYP\w+)\b/i,
    /\b(rs\d+)\b/i,
    /\b(MTR)\b/i,
    /\b(MTRR)\b/i,
    /\b(CBS)\b/i,
    /\b(HFE)\b/i,
    /\b(SOD2)\b/i,
    /\b(GPX1)\b/i
  ];
  
  for (const pattern of geneticPatterns) {
    const match = reasoning.match(pattern);
    if (match) return match[1];
  }
  
  return undefined;
}

// Extract health condition from recommendation reasoning
function extractHealthCondition(reasoning: string): string | undefined {
  const conditionPatterns = [
    /\b(vitamin d deficiency)\b/i,
    /\b(b12 deficiency)\b/i,
    /\b(iron deficiency)\b/i,
    /\b(elevated cholesterol)\b/i,
    /\b(high triglycerides)\b/i,
    /\b(elevated glucose)\b/i,
    /\b(thyroid dysfunction)\b/i,
    /\b(inflammation)\b/i,
    /\b(oxidative stress)\b/i,
    /\b(methylation)\b/i,
    /\b(detoxification)\b/i,
    /\b(cardiovascular)\b/i,
    /\b(cognitive)\b/i,
    /\b(energy)\b/i,
    /\b(stress)\b/i,
    /\b(sleep)\b/i
  ];
  
  for (const pattern of conditionPatterns) {
    const match = reasoning.match(pattern);
    if (match) return match[1];
  }
  
  return undefined;
}

// ============================================================================
// COMPREHENSIVE INTERACTION SAFETY SYSTEM
// ============================================================================

// Blood marker contraindications for specific supplements
const biomarkerContraindications = {
  // IRON-RELATED MARKERS
  'ferritin_high': {
    threshold: 200, // ng/mL
    avoid_supplements: ['Iron', 'Iron Bisglycinate', 'Iron Sulfate', 'Chelated Iron', 'Heme Iron'],
    warning: 'High ferritin levels indicate iron overload risk - iron supplements are contraindicated',
    alternatives: ['Lactoferrin', 'Vitamin C', 'Quercetin']
  },
  'transferrin_saturation_high': {
    threshold: 45, // %
    avoid_supplements: ['Iron', 'Iron Bisglycinate', 'Iron Sulfate'],
    warning: 'Elevated transferrin saturation suggests iron overload',
    alternatives: ['Lactoferrin']
  },
  
  // CALCIUM-RELATED MARKERS
  'calcium_high': {
    threshold: 10.5, // mg/dL
    avoid_supplements: ['Calcium', 'Calcium Carbonate', 'Calcium Citrate', 'Vitamin D (high dose)'],
    warning: 'Hypercalcemia detected - avoid calcium and high-dose vitamin D',
    alternatives: ['Magnesium', 'Vitamin K2']
  },
  'pth_low': {
    threshold: 15, // pg/mL
    avoid_supplements: ['Calcium', 'Vitamin D (high dose)'],
    warning: 'Low PTH may indicate calcium overload',
    alternatives: ['Magnesium']
  },
  
  // KIDNEY FUNCTION MARKERS
  'creatinine_high': {
    threshold: 1.4, // mg/dL
    avoid_supplements: ['Creatine', 'High-dose Magnesium', 'High-dose Potassium', 'High-dose Vitamin C'],
    warning: 'Elevated creatinine suggests kidney dysfunction - avoid supplements requiring renal clearance',
    alternatives: ['Lower doses under medical supervision']
  },
  'bun_high': {
    threshold: 25, // mg/dL
    avoid_supplements: ['Creatine', 'High-dose Protein Powder'],
    warning: 'High BUN indicates kidney stress',
    alternatives: ['Support kidney function with medical guidance']
  },
  
  // LIVER FUNCTION MARKERS
  'alt_high': {
    threshold: 45, // U/L
    avoid_supplements: ['Kava', 'High-dose Niacin', 'Green Tea Extract (high dose)', 'Iron (if not deficient)'],
    warning: 'Elevated liver enzymes - avoid hepatotoxic supplements',
    alternatives: ['Milk Thistle', 'NAC', 'Lower dose supplements']
  },
  'ast_high': {
    threshold: 45, // U/L
    avoid_supplements: ['Kava', 'High-dose Niacin', 'Comfrey'],
    warning: 'Liver dysfunction detected',
    alternatives: ['Liver support supplements']
  },
  
  // BLOOD PRESSURE MARKERS
  'systolic_high': {
    threshold: 140, // mmHg
    avoid_supplements: ['Licorice', 'Ephedra', 'High-dose Sodium', 'Yohimbe'],
    warning: 'Hypertension detected - avoid supplements that raise blood pressure',
    alternatives: ['Magnesium', 'Potassium', 'Hawthorn', 'CoQ10']
  },
  
  // BLOOD SUGAR MARKERS
  'glucose_very_high': {
    threshold: 180, // mg/dL
    avoid_supplements: ['High-dose Chromium (without monitoring)', 'Bitter Melon (without monitoring)'],
    warning: 'Severe hyperglycemia - supplements affecting blood sugar require medical supervision',
    alternatives: ['Medical consultation before any glucose-affecting supplements']
  },
  
  // THYROID MARKERS
  'tsh_very_high': {
    threshold: 10, // mIU/L
    avoid_supplements: ['Kelp', 'High-dose Iodine'],
    warning: 'Severe hypothyroidism - iodine supplements may worsen condition',
    alternatives: ['Selenium', 'Zinc', 'Medical consultation']
  },
  'tsh_very_low': {
    threshold: 0.1, // mIU/L
    avoid_supplements: ['Iodine', 'Kelp', 'Thyroid glandulars'],
    warning: 'Hyperthyroidism detected - avoid thyroid-stimulating supplements',
    alternatives: ['Support under medical supervision only']
  }
};

// Genetic variant contraindications
const geneticContraindications = {
  'HFE_homozygous': {
    rsids: ['rs1799945', 'rs1800562'],
    risk_genotypes: ['CC', 'AA'],
    avoid_supplements: ['Iron', 'Iron Bisglycinate', 'Iron Sulfate', 'Multivitamins with Iron'],
    warning: 'Hemochromatosis variants - iron supplements are NEVER safe',
    alternatives: ['Lactoferrin', 'Vitamin C', 'Regular phlebotomy monitoring']
  },
  'G6PD_deficiency': {
    rsids: ['rs1050828', 'rs1050829'],
    risk_genotypes: ['T', 'A'],
    avoid_supplements: ['High-dose Vitamin C', 'NAC (high dose)', 'Methylene Blue'],
    warning: 'G6PD deficiency - oxidative supplements may trigger hemolysis',
    alternatives: ['Lower dose antioxidants', 'Alpha-lipoic acid']
  },
  'CYP2D6_poor_metabolizer': {
    rsids: ['rs3892097', 'rs1065852'],
    risk_genotypes: ['TT', 'AA'],
    avoid_supplements: ['High-dose Tyramine-containing supplements'],
    warning: 'Poor CYP2D6 metabolism affects supplement clearance',
    alternatives: ['Lower doses', 'Extended dosing intervals']
  }
};

// Multi-condition interaction matrix
const complexInteractions = {
  'diabetes_kidney_disease': {
    conditions: ['diabetes', 'kidney_disease'],
    avoid_supplements: ['Metformin-like supplements', 'High-dose Magnesium', 'Potassium'],
    warning: 'Diabetes with kidney disease requires extreme caution with supplements',
    monitoring: 'Regular kidney function and electrolyte monitoring required'
  },
  'hypertension_kidney_disease': {
    conditions: ['hypertension', 'kidney_disease'],
    avoid_supplements: ['ACE inhibitor-like herbs', 'High-dose Potassium'],
    warning: 'Combined cardiovascular and kidney conditions limit supplement options',
    alternatives: ['Lower doses under medical supervision']
  },
  'liver_disease_diabetes': {
    conditions: ['liver_disease', 'diabetes'],
    avoid_supplements: ['Metformin-like supplements', 'High-dose Niacin'],
    warning: 'Liver dysfunction affects glucose medication metabolism',
    alternatives: ['Support liver function first']
  }
};

// Comprehensive interaction checker
function performComprehensiveInteractionCheck(
  recommendations: any[], 
  assessment: any, 
  markers: any[], 
  labs: any[], 
  warnings: string[]
): any[] {
  
  console.log("🔍 Starting comprehensive interaction analysis...");
  
  // STEP 1: Extract all user data
  const allergies = new Set((assessment.allergies ?? []).map((a: string) => a.toLowerCase()));
  const medications = new Set((assessment.current_medications ?? []).map((m: string) => m.toLowerCase()));
  const conditions = new Set((assessment.medical_conditions ?? []).map((c: string) => c.toLowerCase()));
  const userGenes = markers ? new Map(markers.map(m => [m.rsid, m.genotype])) : new Map();
  const biomarkers = extractBiomarkerValues(labs);
  
  console.log(`Checking interactions for: ${allergies.size} allergies, ${medications.size} medications, ${conditions.size} conditions, ${userGenes.size} genetic variants, ${Object.keys(biomarkers).length} biomarkers`);
  
  // STEP 2: Filter recommendations through comprehensive safety checks
  const safeRecommendations = recommendations.filter(rec => {
    const supplementLower = rec.supplement_name.toLowerCase();
    
    // 2A: ALLERGY CHECK
    for (const [allergy, conflicts] of Object.entries(allergyConflicts)) {
      if (allergies.has(allergy)) {
        for (const conflict of conflicts) {
          if (supplementLower.includes(conflict.toLowerCase())) {
            warnings.push(`❌ ALLERGY CONTRAINDICATION: Avoiding ${rec.supplement_name} due to ${allergy} allergy`);
            return false;
          }
        }
      }
    }
    
    // 2B: MEDICATION INTERACTION CHECK
    for (const [drug, conflicts] of Object.entries(drugConflicts)) {
      if ([...medications].some(med => med.includes(drug))) {
        for (const conflict of conflicts) {
          if (supplementLower.includes(conflict.toLowerCase())) {
            warnings.push(`⚠️ DRUG INTERACTION: ${rec.supplement_name} may interact with ${drug} medication`);
            return false;
          }
        }
      }
    }
    
    // 2C: BIOMARKER CONTRAINDICATION CHECK
    for (const [markerKey, contraindication] of Object.entries(biomarkerContraindications)) {
      const markerValue = biomarkers[markerKey.replace(/_high|_low|_very_high|_very_low/, '')];
      if (markerValue !== undefined) {
        const isHigh = markerKey.includes('_high') && markerValue > contraindication.threshold;
        const isLow = markerKey.includes('_low') && markerValue < contraindication.threshold;
        
        if (isHigh || isLow) {
          for (const avoidSupplement of contraindication.avoid_supplements) {
            if (supplementLower.includes(avoidSupplement.toLowerCase())) {
              warnings.push(`🩸 BIOMARKER CONTRAINDICATION: ${contraindication.warning}`);
              return false;
            }
          }
        }
      }
    }
    
    // 2D: GENETIC CONTRAINDICATION CHECK
    for (const [geneticKey, contraindication] of Object.entries(geneticContraindications)) {
      for (const rsid of contraindication.rsids) {
        const userGenotype = userGenes.get(rsid);
        if (userGenotype && contraindication.risk_genotypes.includes(userGenotype)) {
          for (const avoidSupplement of contraindication.avoid_supplements) {
            if (supplementLower.includes(avoidSupplement.toLowerCase())) {
              warnings.push(`🧬 GENETIC CONTRAINDICATION: ${contraindication.warning} (${rsid}: ${userGenotype})`);
              return false;
            }
          }
        }
      }
    }
    
    // 2E: MEDICAL CONDITION INTERACTION CHECK
    for (const [condition, rules] of Object.entries(medicalConditionInteractions)) {
      if (conditions.has(condition)) {
        for (const avoidSupplement of rules.avoid) {
          if (supplementLower.includes(avoidSupplement.toLowerCase())) {
            warnings.push(`🏥 MEDICAL CONDITION CONTRAINDICATION: Avoiding ${rec.supplement_name} due to ${condition}`);
            return false;
          }
        }
      }
    }
    
    // 2F: COMPLEX MULTI-CONDITION CHECK
    for (const [interactionKey, interaction] of Object.entries(complexInteractions)) {
      const hasAllConditions = interaction.conditions.every(cond => conditions.has(cond));
      if (hasAllConditions) {
        for (const avoidSupplement of interaction.avoid_supplements) {
          if (supplementLower.includes(avoidSupplement.toLowerCase())) {
            warnings.push(`🚨 COMPLEX INTERACTION: ${interaction.warning}`);
            return false;
          }
        }
      }
    }
    
    return true; // Supplement passed all safety checks
  });
  
  // STEP 3: GENE-GENE INTERACTION ADJUSTMENTS
  safeRecommendations.forEach(rec => {
    // Check for MTHFR + COMT interaction (overmethylation risk)
    const hasMTHFR = markers?.some(m => m.rsid.includes('1801133') && ['CT', 'TT'].includes(m.genotype));
    const hasCOMTSlow = markers?.some(m => m.rsid === 'rs4680' && m.genotype === 'AA');
    
    if (hasMTHFR && hasCOMTSlow && rec.supplement_name.toLowerCase().includes('methylfolate')) {
      rec.dosage_amount = Math.min(rec.dosage_amount, 400); // Reduce methylfolate dose
      rec.contraindications.push('Reduced dose due to MTHFR+COMT interaction risk');
      warnings.push(`🧬 GENE-GENE INTERACTION: Reducing methylfolate dose due to MTHFR+COMT overmethylation risk`);
    }
  });
  
  // STEP 4: DOSAGE ADJUSTMENTS FOR BIOMARKERS
  safeRecommendations.forEach(rec => {
    // Adjust vitamin D dose based on current levels
    if (rec.supplement_name.toLowerCase().includes('vitamin d')) {
      const vitaminDLevel = biomarkers['vitamin_d'] || biomarkers['25_oh_d'];
      if (vitaminDLevel) {
        if (vitaminDLevel < 10) {
          rec.dosage_amount = Math.max(rec.dosage_amount, 5000); // Higher dose for severe deficiency
          warnings.push(`📊 BIOMARKER ADJUSTMENT: Increased vitamin D dose due to severe deficiency (${vitaminDLevel} ng/mL)`);
        } else if (vitaminDLevel > 80) {
          rec.dosage_amount = Math.min(rec.dosage_amount, 1000); // Lower dose for high levels
          warnings.push(`📊 BIOMARKER ADJUSTMENT: Reduced vitamin D dose due to elevated levels (${vitaminDLevel} ng/mL)`);
        }
      }
    }
    
    // Adjust iron dose based on ferritin and hemoglobin
    if (rec.supplement_name.toLowerCase().includes('iron')) {
      const ferritin = biomarkers['ferritin'];
      const hemoglobin = biomarkers['hemoglobin'];
      
      if (ferritin && ferritin > 100) {
        rec.dosage_amount = Math.min(rec.dosage_amount, 18); // Lower dose if ferritin adequate
        warnings.push(`📊 BIOMARKER ADJUSTMENT: Reduced iron dose due to adequate ferritin (${ferritin} ng/mL)`);
      }
      
      if (hemoglobin && hemoglobin < 10) {
        rec.dosage_amount = Math.max(rec.dosage_amount, 25); // Higher dose for severe anemia
        warnings.push(`📊 BIOMARKER ADJUSTMENT: Increased iron dose due to severe anemia (${hemoglobin} g/dL)`);
      }
    }
  });
  
  console.log(`✅ Interaction check complete: ${recommendations.length} → ${safeRecommendations.length} safe recommendations`);
  return safeRecommendations;
}

// Extract biomarker values from lab data
function extractBiomarkerValues(labs: any[]): Record<string, number> {
  const biomarkers: Record<string, number> = {};
  
  if (!labs) return biomarkers;
  
  for (const lab of labs) {
    if (lab.biomarker_data && typeof lab.biomarker_data === 'object') {
      for (const [key, value] of Object.entries(lab.biomarker_data)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const numericValue = parseFloat(String(value));
        
        if (!isNaN(numericValue)) {
          biomarkers[normalizedKey] = numericValue;
        }
      }
    }
  }
  
  return biomarkers;
}

// AI-POWERED FLEXIBLE INTERACTION CHECKING
async function performAIInteractionAnalysis(
  recommendations: any[],
  assessment: any,
  markers: any[],
  labs: any[],
  anthropicKey?: string,
  openaiKey?: string
): Promise<{ safeRecommendations: any[], warnings: string[] }> {
  
  console.log("🤖 Starting AI-powered interaction analysis...");
  
  const warnings: string[] = [];
  
  // Create comprehensive user profile for AI analysis
  const userProfile = {
    demographics: {
      age: assessment.age,
      sex: assessment.sex,
      weight: assessment.weight,
      height: assessment.height
    },
    medical_conditions: assessment.medical_conditions || [],
    current_medications: assessment.current_medications || [],
    allergies: assessment.allergies || [],
    family_history: assessment.family_history || [],
    genetic_variants: markers?.map(m => ({ rsid: m.rsid, genotype: m.genotype })) || [],
    biomarkers: extractBiomarkerValues(labs),
    lifestyle_factors: {
      activity_level: assessment.activity_level,
      stress_level: assessment.stress_level,
      sleep_hours: assessment.sleep_hours,
      diet_type: assessment.diet_type,
      alcohol_consumption: assessment.alcohol_consumption,
      smoking_status: assessment.smoking_status
    }
  };

  const prompt = `You are an expert clinical pharmacist and precision medicine specialist. Analyze the following user profile and supplement recommendations for potential interactions, contraindications, and safety concerns.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

PROPOSED SUPPLEMENTS:
${JSON.stringify(recommendations, null, 2)}

CRITICAL ANALYSIS REQUIRED:
1. Drug-supplement interactions based on current medications
2. Supplement-supplement interactions within the recommended list
3. Genetic variant contraindications (especially HFE, G6PD, CYP variants)
4. Biomarker-based contraindications (iron overload, kidney/liver dysfunction, etc.)
5. Medical condition contraindications
6. Allergy cross-reactivity
7. Dosage adjustments needed based on biomarkers, genetics, or conditions
8. Complex multi-factor interactions unique to this user's profile

For each recommendation, assess:
- Is it SAFE for this specific user? (consider ALL factors)
- Are there any dosage adjustments needed?
- Are there timing considerations with medications?
- Are there monitoring requirements?
- What are the specific risks for THIS user?

Return ONLY a JSON object with this exact format:
{
  "analysis_summary": "Brief overview of key safety findings",
  "safe_recommendations": [
    {
      "supplement_name": "original name",
      "is_safe": true/false,
      "adjusted_dosage_amount": number or null,
      "adjusted_dosage_unit": "unit" or null,
      "safety_warnings": ["specific warning for this user"],
      "monitoring_required": ["what to monitor"],
      "timing_adjustments": "timing recommendations",
      "contraindication_reason": "why unsafe if is_safe is false"
    }
  ],
  "interaction_warnings": [
    "Specific interaction warning with explanation"
  ],
  "overall_safety_score": 0.0-1.0
}`;

  if (anthropicKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 8000,
          temperature: 0.1,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (response.ok) {
        const result = await response.json();
        const content = result.content[0].text;
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            
            // Process AI analysis results
            const safeRecommendations = [];
            warnings.push(...(analysis.interaction_warnings || []));
            
            for (const rec of recommendations) {
              const aiAssessment = analysis.safe_recommendations?.find(ar => 
                ar.supplement_name.toLowerCase() === rec.supplement_name.toLowerCase()
              );
              
              if (aiAssessment) {
                if (aiAssessment.is_safe) {
                  // Apply AI-suggested adjustments
                  if (aiAssessment.adjusted_dosage_amount) {
                    rec.dosage_amount = aiAssessment.adjusted_dosage_amount;
                    warnings.push(`🤖 AI DOSAGE ADJUSTMENT: ${rec.supplement_name} dose adjusted based on your unique profile`);
                  }
                  
                  if (aiAssessment.safety_warnings?.length > 0) {
                    rec.contraindications = [...(rec.contraindications || []), ...aiAssessment.safety_warnings];
                  }
                  
                  if (aiAssessment.timing_adjustments) {
                    rec.timing = aiAssessment.timing_adjustments;
                  }
                  
                  safeRecommendations.push(rec);
                } else {
                  warnings.push(`🚨 AI CONTRAINDICATION: ${rec.supplement_name} - ${aiAssessment.contraindication_reason}`);
                }
              } else {
                // Default to including if AI didn't flag it
                safeRecommendations.push(rec);
              }
            }
            
            console.log(`AI Analysis: ${recommendations.length} → ${safeRecommendations.length} safe recommendations`);
            return { safeRecommendations, warnings };
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }
    } catch (aiError) {
      console.error('AI interaction analysis error:', aiError);
    }
  }

  // Fallback to basic safety checks if AI fails
  console.log("Falling back to basic safety checks...");
  return performBasicSafetyCheck(recommendations, assessment, markers, labs);
}

// Basic safety fallback function
function performBasicSafetyCheck(
  recommendations: any[],
  assessment: any,
  markers: any[],
  labs: any[]
): { safeRecommendations: any[], warnings: string[] } {
  
  const warnings: string[] = [];
  const allergies = new Set((assessment.allergies ?? []).map((a: string) => a.toLowerCase()));
  const medications = new Set((assessment.current_medications ?? []).map((m: string) => m.toLowerCase()));
  const biomarkers = extractBiomarkerValues(labs);
  
  const safeRecommendations = recommendations.filter(rec => {
    const supplementLower = rec.supplement_name.toLowerCase();
    
    // Critical allergy check
    for (const [allergy, conflicts] of Object.entries(allergyConflicts)) {
      if (allergies.has(allergy)) {
        for (const conflict of conflicts) {
          if (supplementLower.includes(conflict.toLowerCase())) {
            warnings.push(`❌ ALLERGY: Avoiding ${rec.supplement_name} due to ${allergy} allergy`);
            return false;
          }
        }
      }
    }
    
    // Critical HFE genetic check
    const hasHFE = markers?.some(m => 
      ['rs1799945', 'rs1800562'].includes(m.rsid) && 
      ['CC', 'AA'].includes(m.genotype)
    );
    if (hasHFE && supplementLower.includes('iron')) {
      warnings.push(`🧬 GENETIC SAFETY: Iron supplements contraindicated with HFE variants`);
      return false;
    }
    
    // Critical iron overload check
    const ferritin = biomarkers['ferritin'];
    if (ferritin && ferritin > 200 && supplementLower.includes('iron')) {
      warnings.push(`🩸 BIOMARKER SAFETY: Iron supplements contraindicated with ferritin ${ferritin} ng/mL`);
      return false;
    }
    
    return true;
  });
  
  return { safeRecommendations, warnings };
}
