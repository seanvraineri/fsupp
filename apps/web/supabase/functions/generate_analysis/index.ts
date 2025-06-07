// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// --- Inlined data & helpers ( avoids cross-file imports ) ----
export const geneReferences = [
  // === METHYLATION PATHWAY ===
  {
    gene: 'MTHFR',
    rsids: ['rs1801133', 'rs1801131'],
    genotypesOfConcern: ['CT', 'TT', 'AC', 'CC'],
    impact: 'Reduced conversion of folate to 5-MTHF leading to elevated homocysteine',
    supplement: 'L-Methylfolate',
    dosage: '400–1000 µg daily',
    evidence: 'high',
    cautions: 'Avoid >800 µg folic acid as it can mask B-12 deficiency',
  },
  {
    gene: 'MTR',
    rsids: ['rs1805087'],
    genotypesOfConcern: ['AG', 'GG'],
    impact: 'Impaired methionine synthase activity affecting B12 utilization',
    supplement: 'Methyl-B12',
    dosage: '1-5 mg sublingual daily',
    evidence: 'moderate',
    cautions: 'Monitor B12 levels; PPIs reduce absorption',
  },
  {
    gene: 'MTRR',
    rsids: ['rs1801394'],
    genotypesOfConcern: ['AG', 'GG'],
    impact: 'Reduced methionine synthase reductase activity',
    supplement: 'Methyl-B12; Betaine (TMG)',
    dosage: '1-5 mg B12, 500-1000 mg TMG daily',
    evidence: 'moderate',
    cautions: 'Support methylation cycle',
  },
  {
    gene: 'COMT',
    rsids: ['rs4680'],
    genotypesOfConcern: ['AA'],
    impact: 'Slow COMT activity; accumulation of dopamine and norepinephrine',
    supplement: 'Magnesium; SAMe',
    dosage: '400-600 mg Mg, 200-400 mg SAMe daily',
    evidence: 'moderate',
    cautions: 'Avoid high-dose methyl donors if overmethylation symptoms',
  },
  {
    gene: 'COMT',
    rsids: ['rs4680'],
    genotypesOfConcern: ['GG'],
    impact: 'Fast COMT activity; rapid dopamine breakdown',
    supplement: 'L-Tyrosine; Green Tea Extract',
    dosage: '500-1000 mg L-Tyrosine, 300-400 mg EGCG daily',
    evidence: 'moderate',
    cautions: 'Support dopamine production',
  },
  {
    gene: 'AHCY',
    rsids: ['rs819147'],
    genotypesOfConcern: ['TT'],
    impact: 'Reduced S-adenosylhomocysteine hydrolase activity',
    supplement: 'Glycine; Betaine (TMG)',
    dosage: '1-3g Glycine, 500-1000 mg TMG daily',
    evidence: 'low',
    cautions: 'Support homocysteine clearance',
  },
  {
    gene: 'CBS',
    rsids: ['rs234706'],
    genotypesOfConcern: ['GG'],
    impact: 'Upregulated transsulfuration pathway',
    supplement: 'Molybdenum; Vitamin B6',
    dosage: '150-300 µg Mo, 25-50 mg B6 daily',
    evidence: 'low',
    cautions: 'Avoid high-sulfur supplements if sensitive',
  },
  
  // === VITAMIN D PATHWAY ===
  {
    gene: 'VDR',
    rsids: ['rs2228570', 'rs1544410'],
    genotypesOfConcern: ['CC', 'AA'],
    impact: 'Reduced vitamin D receptor activity',
    supplement: 'Vitamin D3 + K2',
    dosage: '2000–5000 IU D3, 100-200 µg K2 daily',
    evidence: 'moderate',
    cautions: 'Monitor 25(OH)D levels; glucocorticoids reduce receptor activity',
  },
  {
    gene: 'CYP2R1',
    rsids: ['rs10741657'],
    genotypesOfConcern: ['AA'],
    impact: 'Reduced 25-hydroxylase activity; lower vitamin D activation',
    supplement: 'Vitamin D3',
    dosage: '3000-5000 IU daily',
    evidence: 'moderate',
    cautions: 'May need higher doses to achieve optimal levels',
  },
  {
    gene: 'CYP27B1',
    rsids: ['rs10877012'],
    genotypesOfConcern: ['TT'],
    impact: 'Reduced 1α-hydroxylase activity',
    supplement: 'Calcitriol (active D3)',
    dosage: 'Consult physician for dosing',
    evidence: 'low',
    cautions: 'May need active form of vitamin D',
  },
  {
    gene: 'CYP24A1',
    rsids: ['rs6013897'],
    genotypesOfConcern: ['TT'],
    impact: 'Slow vitamin D degradation; risk of toxicity',
    supplement: 'Lower dose Vitamin D3',
    dosage: '1000-2000 IU daily',
    evidence: 'low',
    cautions: 'Monitor vitamin D levels closely; risk of hypercalcemia',
  },

  // === B-VITAMIN METABOLISM ===
  {
    gene: 'FUT2',
    rsids: ['rs601338'],
    genotypesOfConcern: ['AA'],
    impact: 'Non-secretor status; reduced B12 absorption',
    supplement: 'Methyl-B12 (sublingual)',
    dosage: '1-5 mg sublingual daily',
    evidence: 'moderate',
    cautions: 'Bypass gut absorption issues',
  },
  {
    gene: 'TCN2',
    rsids: ['rs1801198'],
    genotypesOfConcern: ['GG'],
    impact: 'Reduced transcobalamin II function; B12 transport issues',
    supplement: 'High-dose B12 (methylcobalamin)',
    dosage: '5-10 mg daily',
    evidence: 'moderate',
    cautions: 'May need higher doses for transport',
  },

  // === OMEGA-3 METABOLISM ===
  {
    gene: 'FADS1',
    rsids: ['rs174550'],
    genotypesOfConcern: ['GG'],
    impact: 'Reduced delta-6-desaturase; poor omega-3 conversion',
    supplement: 'EPA/DHA (preformed)',
    dosage: '1-2g EPA+DHA daily',
    evidence: 'high',
    cautions: 'Cannot efficiently convert ALA to EPA/DHA',
  },
  {
    gene: 'FADS2',
    rsids: ['rs174575'],
    genotypesOfConcern: ['GG'],
    impact: 'Reduced fatty acid desaturase activity',
    supplement: 'Fish Oil (EPA/DHA)',
    dosage: '1-2g EPA+DHA daily',
    evidence: 'high',
    cautions: 'Need preformed omega-3s',
  },

  // === ANTIOXIDANT PATHWAYS ===
  {
    gene: 'SOD2',
    rsids: ['rs4880'],
    genotypesOfConcern: ['AA'],
    impact: 'Reduced mitochondrial superoxide dismutase activity',
    supplement: 'Manganese; CoQ10; PQQ',
    dosage: '5-10 mg Mn, 100-200 mg CoQ10, 10-20 mg PQQ daily',
    evidence: 'moderate',
    cautions: 'Support mitochondrial antioxidant defense',
  },
  {
    gene: 'GPX1',
    rsids: ['rs1050450'],
    genotypesOfConcern: ['TT'],
    impact: 'Reduced glutathione peroxidase activity',
    supplement: 'Selenium; NAC; Glutathione',
    dosage: '200 µg Se, 600 mg NAC, 250 mg Glutathione daily',
    evidence: 'moderate',
    cautions: 'Support glutathione system',
  },
  {
    gene: 'GSTM1',
    rsids: ['rs366631'],
    genotypesOfConcern: ['null'],
    impact: 'Absent glutathione S-transferase M1; reduced detoxification',
    supplement: 'NAC; Milk Thistle; Cruciferous Extract',
    dosage: '600 mg NAC, 150 mg Silymarin, 200 mg DIM daily',
    evidence: 'moderate',
    cautions: 'Support phase II detoxification',
  },
  {
    gene: 'GSTT1',
    rsids: ['rs17856199'],
    genotypesOfConcern: ['null'],
    impact: 'Absent glutathione S-transferase T1',
    supplement: 'NAC; Alpha-Lipoic Acid',
    dosage: '600 mg NAC, 300 mg ALA daily',
    evidence: 'moderate',
    cautions: 'Support glutathione synthesis',
  },

  // === CARDIOVASCULAR & LIPID METABOLISM ===
  {
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypesOfConcern: ['ε3/ε4', 'ε4/ε4'],
    impact: "Higher LDL-C & increased Alzheimer's risk",
    supplement: 'DHA-rich fish oil; Curcumin',
    dosage: 'EPA+DHA ≥ 1g, 500-1000 mg Curcumin daily',
    evidence: 'high',
    cautions: 'High saturated-fat diet worsens lipids in ε4 carriers',
  },
  {
    gene: 'LPA',
    rsids: ['rs3798220'],
    genotypesOfConcern: ['CC'],
    impact: 'Elevated lipoprotein(a); increased cardiovascular risk',
    supplement: 'Niacin; Omega-3; CoQ10',
    dosage: '500-1000 mg Niacin, 2g Omega-3, 100 mg CoQ10 daily',
    evidence: 'moderate',
    cautions: 'Monitor liver function with niacin',
  },
  {
    gene: 'ACE',
    rsids: ['rs4340'],
    genotypesOfConcern: ['DD'],
    impact: 'Higher ACE activity; increased cardiovascular risk',
    supplement: 'Magnesium; Potassium; Hawthorn',
    dosage: '400 mg Mg, 99 mg K, 300 mg Hawthorn daily',
    evidence: 'moderate',
    cautions: 'Support cardiovascular health',
  },

  // === IRON METABOLISM ===
  {
    gene: 'HFE',
    rsids: ['rs1799945', 'rs1800562'],
    genotypesOfConcern: ['CC', 'AA'],
    impact: 'Hemochromatosis variants; iron overload risk',
    supplement: 'Avoid iron; Use Lactoferrin',
    dosage: 'NO iron supplements; 200-400 mg Lactoferrin if needed',
    evidence: 'high',
    cautions: 'NEVER supplement iron; monitor ferritin levels',
  },
  {
    gene: 'TMPRSS6',
    rsids: ['rs855791'],
    genotypesOfConcern: ['GG'],
    impact: 'Increased hepcidin; reduced iron absorption',
    supplement: 'Iron (with Vitamin C)',
    dosage: '18-25 mg Iron with 500 mg Vitamin C daily',
    evidence: 'moderate',
    cautions: 'Take with vitamin C for better absorption',
  },

  // === CAFFEINE & STIMULANT METABOLISM ===
  {
    gene: 'CYP1A2',
    rsids: ['rs762551'],
    genotypesOfConcern: ['AA'],
    impact: 'Slow caffeine metabolism; increased sensitivity',
    supplement: 'L-Theanine; Magnesium',
    dosage: '200 mg L-Theanine, 400 mg Mg daily',
    evidence: 'moderate',
    cautions: 'Limit caffeine; support relaxation',
  },

  // === OTHER IMPORTANT VARIANTS ===
  {
    gene: 'ALDH2',
    rsids: ['rs671'],
    genotypesOfConcern: ['AG', 'AA'],
    impact: 'Reduced aldehyde dehydrogenase; alcohol sensitivity',
    supplement: 'NAD+; Milk Thistle; B-Complex',
    dosage: '100 mg NAD+, 150 mg Silymarin, B-Complex daily',
    evidence: 'low',
    cautions: 'Support liver detoxification',
  },
  {
    gene: 'SLCO1B1',
    rsids: ['rs4149056'],
    genotypesOfConcern: ['CC'],
    impact: 'Reduced statin transport; increased myopathy risk',
    supplement: 'CoQ10; Red Yeast Rice (if not on statins)',
    dosage: '100-200 mg CoQ10 daily',
    evidence: 'moderate',
    cautions: 'Essential if taking statins; avoid RYR with statins',
  },
  {
    gene: 'APOC3',
    rsids: ['rs2854116'],
    genotypesOfConcern: ['CC'],
    impact: 'Increased triglycerides',
    supplement: 'Omega-3 (high EPA); Berberine',
    dosage: '2-3g EPA, 500 mg Berberine twice daily',
    evidence: 'high',
    cautions: 'Focus on triglyceride reduction',
  },
  {
    gene: 'CETP',
    rsids: ['rs708272'],
    genotypesOfConcern: ['GG'],
    impact: 'Increased cholesteryl ester transfer protein activity',
    supplement: 'Niacin; Plant Sterols',
    dosage: '500 mg Niacin, 2g Plant Sterols daily',
    evidence: 'moderate',
    cautions: 'Support HDL cholesterol',
  }
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
          
          // Create genetic-driven recommendation
          const supplements = geneRef.supplement.split(';').map(s => s.trim());
          
          supplements.forEach(supplement => {
            geneticRecommendations.push({
              supplement_name: supplement,
              dosage_amount: minDose,
              dosage_unit: unit,
              frequency: 'daily',
              timing: getOptimalTiming(supplement),
              recommendation_reason: `Genetic Analysis: Your ${marker.rsid} (${marker.genotype}) variant in the ${geneRef.gene} gene causes ${geneRef.impact.toLowerCase()}. This genetic predisposition requires targeted ${supplement} supplementation to optimize your methylation, detoxification, or metabolic pathways.`,
              evidence_quality: geneRef.evidence,
              priority_score: geneRef.evidence === 'high' ? 9 : geneRef.evidence === 'moderate' ? 7 : 5,
              expected_benefits: [`Genetic pathway optimization within 4-8 weeks`, `Improved ${geneRef.gene} function`, `Reduced risk of ${geneRef.gene}-related health issues`],
              contraindications: geneRef.cautions ? [geneRef.cautions] : [],
              genetic_reasoning: `${marker.rsid} (${marker.genotype}) variant: ${geneRef.impact}`,
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
                biomarker_reasoning: `Lab Analysis: Your ${biomarkerName} level of ${value} indicates ${biomarkerRecommendation.concern}. This biomarker abnormality requires targeted supplementation to restore optimal levels and prevent associated health risks.`,
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

// Comprehensive biomarker analysis function
function analyzeBiomarker(normalizedName: string, numericValue: number, displayName: string): any | null {
  // Skip non-numeric values
  if (isNaN(numericValue)) return null;
  
  // VITAMIN D ANALYSIS
  if (normalizedName.includes('vitamin_d') || normalizedName.includes('25_oh_d')) {
    if (numericValue < 30) {
      return {
        supplement_name: 'Vitamin D3',
        dosage_amount: numericValue < 20 ? 5000 : 3000,
        dosage_unit: 'IU',
        frequency: 'daily',
        timing: 'with breakfast (fat-soluble)',
        recommendation_reason: `Your vitamin D level of ${numericValue} ng/mL is below optimal (30-50 ng/mL).`,
        evidence_quality: 'high',
        priority_score: numericValue < 20 ? 9 : 7,
        expected_benefits: ['Improved immune function within 4-6 weeks', 'Better bone health', 'Enhanced mood regulation'],
        contraindications: ['Monitor levels to avoid toxicity'],
        concern: 'vitamin D deficiency'
      };
    }
  }
  
  // B12 ANALYSIS
  if (normalizedName.includes('b12') || normalizedName.includes('cobalamin')) {
    if (numericValue < 400) {
      return {
        supplement_name: 'Methylcobalamin (B12)',
        dosage_amount: numericValue < 200 ? 5000 : 2000,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'morning sublingual',
        recommendation_reason: `Your B12 level of ${numericValue} pg/mL is below optimal (400-900 pg/mL).`,
        evidence_quality: 'high',
        priority_score: numericValue < 200 ? 9 : 7,
        expected_benefits: ['Increased energy within 2-4 weeks', 'Improved cognitive function', 'Better nerve health'],
        contraindications: ['Use methylated form for better absorption'],
        concern: 'B12 deficiency'
      };
    }
  }
  
  // IRON/FERRITIN ANALYSIS
  if (normalizedName.includes('ferritin')) {
    if (numericValue < 30) {
      return {
        supplement_name: 'Iron Bisglycinate',
        dosage_amount: 25,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'morning on empty stomach with vitamin C',
        recommendation_reason: `Your ferritin level of ${numericValue} ng/mL indicates iron deficiency (optimal: 30-150 ng/mL).`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Improved energy within 4-8 weeks', 'Better oxygen transport', 'Reduced fatigue'],
        contraindications: ['Take with vitamin C, avoid with calcium', 'Monitor levels to prevent overload'],
        concern: 'iron deficiency'
      };
    }
    if (numericValue > 200) {
      return {
        supplement_name: 'Lactoferrin',
        dosage_amount: 200,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your ferritin level of ${numericValue} ng/mL is elevated, suggesting iron overload.`,
        evidence_quality: 'moderate',
        priority_score: 7,
        expected_benefits: ['Iron regulation within 8-12 weeks', 'Reduced oxidative stress'],
        contraindications: ['AVOID iron supplements', 'Monitor ferritin levels'],
        concern: 'iron overload'
      };
    }
  }
  
  // CHOLESTEROL ANALYSIS
  if (normalizedName.includes('ldl') || normalizedName.includes('ldl_cholesterol')) {
    if (numericValue > 100) {
      return {
        supplement_name: 'Omega-3 (EPA/DHA)',
        dosage_amount: 2000,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your LDL cholesterol of ${numericValue} mg/dL is above optimal (<100 mg/dL).`,
        evidence_quality: 'high',
        priority_score: numericValue > 130 ? 8 : 6,
        expected_benefits: ['Improved lipid profile within 8-12 weeks', 'Reduced cardiovascular risk'],
        contraindications: ['Monitor if on blood thinners'],
        concern: 'elevated LDL cholesterol'
      };
    }
  }
  
  // TRIGLYCERIDES ANALYSIS
  if (normalizedName.includes('triglycerides')) {
    if (numericValue > 150) {
      return {
        supplement_name: 'Berberine',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'before meals',
        recommendation_reason: `Your triglycerides of ${numericValue} mg/dL are above optimal (<150 mg/dL).`,
        evidence_quality: 'high',
        priority_score: numericValue > 200 ? 8 : 6,
        expected_benefits: ['Reduced triglycerides within 8-12 weeks', 'Improved metabolic health'],
        contraindications: ['Monitor blood sugar if diabetic'],
        concern: 'elevated triglycerides'
      };
    }
  }
  
  // GLUCOSE ANALYSIS
  if (normalizedName.includes('glucose') && !normalizedName.includes('hba1c')) {
    if (numericValue > 100) {
      return {
        supplement_name: 'Chromium Picolinate',
        dosage_amount: 200,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'with largest meal',
        recommendation_reason: `Your fasting glucose of ${numericValue} mg/dL is above optimal (<100 mg/dL).`,
        evidence_quality: 'moderate',
        priority_score: numericValue > 125 ? 8 : 6,
        expected_benefits: ['Better glucose control within 4-6 weeks', 'Improved insulin sensitivity'],
        contraindications: ['Monitor blood sugar closely if diabetic'],
        concern: 'elevated glucose'
      };
    }
  }
  
  // TSH ANALYSIS
  if (normalizedName.includes('tsh')) {
    if (numericValue > 3.0) {
      return {
        supplement_name: 'Selenium',
        dosage_amount: 200,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'with breakfast',
        recommendation_reason: `Your TSH of ${numericValue} mIU/L suggests suboptimal thyroid function (optimal: 1.0-3.0 mIU/L).`,
        evidence_quality: 'moderate',
        priority_score: 7,
        expected_benefits: ['Improved thyroid function within 8-12 weeks', 'Better energy levels'],
        contraindications: ['Monitor thyroid levels', 'Take 4 hours from thyroid medication'],
        concern: 'elevated TSH'
      };
    }
  }
  
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
      recommendation_reason: `Goal-Based: Supporting your weight loss goal with metabolism-boosting green tea extract containing EGCG.`,
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
      recommendation_reason: `Goal-Based: Supporting your energy goals with CoQ10 for mitochondrial energy production.`,
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
      recommendation_reason: `Goal-Based: Supporting your stress management goals with adaptogenic ashwagandha.`,
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
      recommendation_reason: `Concern-Based: Addressing your sleep issues with melatonin for circadian rhythm regulation.`,
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
      recommendation_reason: `Concern-Based: Addressing your digestive concerns with comprehensive probiotic support.`,
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
  
  let summary = "🧬 **Comprehensive Precision Medicine Analysis**\n\n";
  
  if (geneticConcerns.length > 0) {
    summary += `**Genetic Analysis:** Your genetic profile reveals ${geneticConcerns.length} variant(s) of concern: ${geneticConcerns.join(', ')}. These genetic predispositions require targeted supplementation to optimize your metabolic pathways.\n\n`;
  }
  
  if (biomarkerConcerns.length > 0) {
    summary += `**Biomarker Analysis:** Your lab results show ${biomarkerConcerns.length} biomarker(s) outside optimal ranges: ${biomarkerConcerns.slice(0, 3).join(', ')}${biomarkerConcerns.length > 3 ? ' and others' : ''}. These abnormalities indicate specific nutritional needs.\n\n`;
  }
  
  if (healthGoals.length > 0) {
    summary += `**Health Goals Integration:** Your personalized plan addresses your specific goals: ${healthGoals.join(', ')}. Each recommendation is tailored to support these objectives.\n\n`;
  }
  
  const highPriority = recommendations.filter(r => (r.priority_score || 0) >= 8).length;
  summary += `**Recommendation Summary:** ${recommendations.length} personalized supplements identified, with ${highPriority} high-priority recommendations based on your genetic variants and biomarker abnormalities. This precision approach ensures optimal health outcomes tailored to your unique biology.`;
  
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
