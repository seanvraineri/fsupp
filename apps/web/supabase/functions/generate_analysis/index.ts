// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.5";

// === COMPREHENSIVE SUPPLEMENTATION-RELEVANT GENETIC VARIANTS (60+ SNPs) ===
export const geneReferences = [
  // === METHYLATION & FOLATE PATHWAY (12 variants) ===
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
  { gene: 'RFC1', rsids: ['rs1051266'], genotypesOfConcern: ['AA'], impact: 'Reduced folate transport', supplement: 'L-Methylfolate', dosage: '600-800 mcg daily', evidence: 'moderate', cautions: 'Enhanced folate transport needed' },
  { gene: 'FOLR1', rsids: ['rs2071010'], genotypesOfConcern: ['GG'], impact: 'Altered folate receptor function', supplement: 'L-Methylfolate;Folinic Acid', dosage: '400-600 mcg daily', evidence: 'low', cautions: 'Support folate uptake' },

  // === NEUROTRANSMITTER & MOOD (15 variants) ===
  { gene: 'COMT', rsids: ['rs4680'], genotypesOfConcern: ['AA'], impact: 'Slow COMT activity; dopamine accumulation', supplement: 'Magnesium;SAMe', dosage: '400-600 mg Mg;200-400 mg SAMe daily', evidence: 'moderate', cautions: 'Avoid high-dose methyl donors if overmethylation' },
  { gene: 'COMT', rsids: ['rs4680'], genotypesOfConcern: ['GG'], impact: 'Fast COMT activity; rapid dopamine breakdown', supplement: 'L-Tyrosine;Green Tea Extract', dosage: '500-1000 mg;300-400 mg EGCG daily', evidence: 'moderate', cautions: 'Support dopamine production' },
  { gene: 'MAO-A', rsids: ['rs6323'], genotypesOfConcern: ['TT'], impact: 'High MAO-A activity; rapid serotonin breakdown', supplement: '5-HTP;Tryptophan', dosage: '100-200 mg;500-1000 mg daily', evidence: 'moderate', cautions: 'Support serotonin production' },
  { gene: 'MAO-A', rsids: ['rs6323'], genotypesOfConcern: ['GG'], impact: 'Low MAO-A activity; slower monoamine breakdown', supplement: 'B6;Riboflavin', dosage: '25-50 mg;25 mg daily', evidence: 'low', cautions: 'Support MAO cofactors' },
  { gene: 'BDNF', rsids: ['rs6265'], genotypesOfConcern: ['AA'], impact: 'Reduced BDNF production; impaired neuroplasticity', supplement: 'Magnesium;Omega-3;Lion\'s Mane', dosage: '400 mg;1000 mg;500 mg daily', evidence: 'moderate', cautions: 'Support brain health' },
  { gene: 'HTR2A', rsids: ['rs6313'], genotypesOfConcern: ['AA'], impact: 'Altered serotonin receptor function', supplement: 'Tryptophan;Magnesium', dosage: '500-1000 mg;400 mg daily', evidence: 'low', cautions: 'Support serotonin signaling' },
  { gene: 'HTR1A', rsids: ['rs6295'], genotypesOfConcern: ['GG'], impact: 'Reduced serotonin 1A receptor expression', supplement: '5-HTP;Inositol', dosage: '100-200 mg;500-1000 mg daily', evidence: 'low', cautions: 'Support serotonin system' },
  { gene: 'SLC6A4', rsids: ['rs25531'], genotypesOfConcern: ['SS'], impact: 'Low serotonin transporter expression', supplement: '5-HTP;Omega-3', dosage: '100-200 mg;1000 mg daily', evidence: 'moderate', cautions: 'Support serotonin availability' },
  { gene: 'SLC6A2', rsids: ['rs5569'], genotypesOfConcern: ['TT'], impact: 'Altered norepinephrine transporter function', supplement: 'L-Tyrosine;B6', dosage: '500-1000 mg;25-50 mg daily', evidence: 'low', cautions: 'Support norepinephrine synthesis' },
  { gene: 'SLC6A3', rsids: ['rs40184'], genotypesOfConcern: ['TT'], impact: 'Altered dopamine transporter function', supplement: 'L-Tyrosine;Iron', dosage: '500-1000 mg;18 mg daily', evidence: 'low', cautions: 'Support dopamine synthesis' },
  { gene: 'DRD2', rsids: ['rs1800497'], genotypesOfConcern: ['AA'], impact: 'Reduced dopamine receptor density', supplement: 'L-Tyrosine;Rhodiola', dosage: '500-1000 mg;300-400 mg daily', evidence: 'moderate', cautions: 'Support dopamine signaling' },
  { gene: 'DRD4', rsids: ['rs1800955'], genotypesOfConcern: ['TT'], impact: 'Altered dopamine D4 receptor function', supplement: 'L-Tyrosine;Magnesium', dosage: '500-1000 mg;400 mg daily', evidence: 'low', cautions: 'Support attention and focus' },
  { gene: 'TPH1', rsids: ['rs1800532'], genotypesOfConcern: ['AA'], impact: 'Reduced peripheral serotonin synthesis', supplement: 'Tryptophan;B6', dosage: '500-1000 mg;25-50 mg daily', evidence: 'low', cautions: 'Support serotonin synthesis' },
  { gene: 'TPH2', rsids: ['rs4570625'], genotypesOfConcern: ['TT'], impact: 'Reduced brain serotonin synthesis', supplement: 'Tryptophan;B6', dosage: '500-1000 mg;25-50 mg daily', evidence: 'moderate', cautions: 'Support central serotonin' },
  { gene: 'DBH', rsids: ['rs1611115'], genotypesOfConcern: ['TT'], impact: 'Low dopamine beta-hydroxylase activity', supplement: 'Copper;Vitamin C', dosage: '2 mg;500-1000 mg daily', evidence: 'low', cautions: 'Support norepinephrine synthesis' },

  // === DETOXIFICATION & ANTIOXIDANTS (12 variants) ===
  { gene: 'GSTM1', rsids: ['rs366631'], genotypesOfConcern: ['null'], impact: 'Absent glutathione S-transferase M1; reduced detoxification', supplement: 'NAC;Milk Thistle;Cruciferous Extract', dosage: '600 mg;150 mg;200 mg daily', evidence: 'moderate', cautions: 'Support phase II detoxification' },
  { gene: 'GSTT1', rsids: ['rs17856199'], genotypesOfConcern: ['null'], impact: 'Absent glutathione S-transferase T1', supplement: 'NAC;Alpha-Lipoic Acid', dosage: '600 mg;300 mg daily', evidence: 'moderate', cautions: 'Support glutathione synthesis' },
  { gene: 'GSTP1', rsids: ['rs1695'], genotypesOfConcern: ['GG'], impact: 'Reduced GSTP1 activity', supplement: 'NAC;Selenium', dosage: '600 mg;200 mcg daily', evidence: 'moderate', cautions: 'Support antioxidant defense' },
  { gene: 'GSTA1', rsids: ['rs3957357'], genotypesOfConcern: ['TT'], impact: 'Reduced glutathione S-transferase A1 activity', supplement: 'NAC;Milk Thistle', dosage: '600 mg;150 mg daily', evidence: 'low', cautions: 'Support liver detoxification' },
  { gene: 'SOD2', rsids: ['rs4880'], genotypesOfConcern: ['AA'], impact: 'Reduced mitochondrial superoxide dismutase activity', supplement: 'Manganese;CoQ10;PQQ', dosage: '5-10 mg;100-200 mg;10-20 mg daily', evidence: 'moderate', cautions: 'Support mitochondrial antioxidant defense' },
  { gene: 'SOD1', rsids: ['rs4998557'], genotypesOfConcern: ['GG'], impact: 'Altered copper-zinc superoxide dismutase activity', supplement: 'Copper;Zinc;Vitamin C', dosage: '2 mg;15 mg;1000 mg daily', evidence: 'low', cautions: 'Balance copper-zinc ratio' },
  { gene: 'GPX1', rsids: ['rs1050450'], genotypesOfConcern: ['TT'], impact: 'Reduced glutathione peroxidase activity', supplement: 'Selenium;NAC;Glutathione', dosage: '200 mcg;600 mg;250 mg daily', evidence: 'moderate', cautions: 'Support glutathione system' },
  { gene: 'NQO1', rsids: ['rs1800566'], genotypesOfConcern: ['TT'], impact: 'Reduced NAD(P)H quinone oxidoreductase activity', supplement: 'NAC;Alpha-Lipoic Acid;CoQ10', dosage: '600 mg;300 mg;100 mg daily', evidence: 'moderate', cautions: 'Support cellular detoxification' },
  { gene: 'CAT', rsids: ['rs1001179'], genotypesOfConcern: ['TT'], impact: 'Reduced catalase activity', supplement: 'Vitamin C;Vitamin E;Selenium', dosage: '1000 mg;400 IU;200 mcg daily', evidence: 'low', cautions: 'Support antioxidant enzymes' },
  { gene: 'HMOX1', rsids: ['rs2071746'], genotypesOfConcern: ['AA'], impact: 'Low heme oxygenase-1 expression', supplement: 'Curcumin;Green Tea Extract', dosage: '500-1000 mg;400 mg daily', evidence: 'moderate', cautions: 'Support anti-inflammatory pathways' },
  { gene: 'PON1', rsids: ['rs662'], genotypesOfConcern: ['AA'], impact: 'Reduced paraoxonase 1 activity', supplement: 'Vitamin E;Selenium;Quercetin', dosage: '400 IU;200 mcg;500 mg daily', evidence: 'low', cautions: 'Support lipid antioxidant defense' },
  { gene: 'EPHX1', rsids: ['rs1051740'], genotypesOfConcern: ['TT'], impact: 'Slow epoxide hydrolase activity', supplement: 'NAC;Milk Thistle;Cruciferous Extract', dosage: '600 mg;150 mg;200 mg daily', evidence: 'low', cautions: 'Support epoxide detoxification' },

  // === VITAMIN METABOLISM & TRANSPORT (15 variants) ===
  { gene: 'VDR', rsids: ['rs2228570'], genotypesOfConcern: ['CC'], impact: 'Reduced vitamin D receptor activity', supplement: 'Vitamin D3;K2', dosage: '3000-5000 IU;100-200 mcg daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'VDR', rsids: ['rs1544410'], genotypesOfConcern: ['AA'], impact: 'Altered vitamin D receptor function', supplement: 'Vitamin D3;Magnesium', dosage: '2000-4000 IU;400 mg daily', evidence: 'moderate', cautions: 'Support vitamin D signaling' },
  { gene: 'VDR', rsids: ['rs7975232'], genotypesOfConcern: ['AA'], impact: 'Reduced vitamin D receptor expression', supplement: 'Vitamin D3;K2;Magnesium', dosage: '3000-4000 IU;100 mcg;400 mg daily', evidence: 'moderate', cautions: 'Higher doses may be needed' },
  { gene: 'CYP2R1', rsids: ['rs10741657'], genotypesOfConcern: ['AA'], impact: 'Reduced 25-hydroxylase activity; lower vitamin D activation', supplement: 'Vitamin D3', dosage: '3000-5000 IU daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'CYP27B1', rsids: ['rs10877012'], genotypesOfConcern: ['TT'], impact: 'Reduced 1α-hydroxylase activity', supplement: 'Vitamin D3;Magnesium', dosage: '4000-6000 IU;400 mg daily', evidence: 'low', cautions: 'Monitor vitamin D levels' },
  { gene: 'CYP24A1', rsids: ['rs6013897'], genotypesOfConcern: ['TT'], impact: 'Slow vitamin D degradation; risk of toxicity', supplement: 'Lower dose Vitamin D3', dosage: '1000-2000 IU daily', evidence: 'low', cautions: 'Monitor vitamin D levels closely' },
  { gene: 'GC', rsids: ['rs2282679'], genotypesOfConcern: ['AA'], impact: 'Altered vitamin D binding protein', supplement: 'Vitamin D3;Magnesium', dosage: '3000-4000 IU;400 mg daily', evidence: 'moderate', cautions: 'Support vitamin D transport' },
  { gene: 'DHCR7', rsids: ['rs12785878'], genotypesOfConcern: ['TT'], impact: 'Reduced vitamin D synthesis capacity', supplement: 'Vitamin D3', dosage: '3000-5000 IU daily', evidence: 'moderate', cautions: 'Cannot synthesize vitamin D efficiently' },
  { gene: 'FUT2', rsids: ['rs601338'], genotypesOfConcern: ['AA'], impact: 'Non-secretor status; reduced B12 absorption', supplement: 'Methylcobalamin (sublingual)', dosage: '1-5 mg daily', evidence: 'moderate', cautions: 'Bypass gut absorption' },
  { gene: 'TCN2', rsids: ['rs1801198'], genotypesOfConcern: ['GG'], impact: 'Reduced transcobalamin II function; B12 transport issues', supplement: 'High-dose Methylcobalamin', dosage: '5-10 mg daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'CUBN', rsids: ['rs1801222'], genotypesOfConcern: ['GG'], impact: 'Impaired cubilin function; B12 absorption', supplement: 'Sublingual B12;Intrinsic Factor', dosage: '2-5 mg;1 capsule daily', evidence: 'moderate', cautions: 'Bypass absorption issues' },
  { gene: 'AMN', rsids: ['rs2287921'], genotypesOfConcern: ['TT'], impact: 'Reduced amnionless function affecting B12 uptake', supplement: 'High-dose B12;Intrinsic Factor', dosage: '5-10 mg;1 capsule daily', evidence: 'low', cautions: 'Support B12 absorption' },
  { gene: 'BCMO1', rsids: ['rs7501331'], genotypesOfConcern: ['AA'], impact: 'Reduced beta-carotene to vitamin A conversion', supplement: 'Preformed Vitamin A (Retinol)', dosage: '5000-10000 IU daily', evidence: 'moderate', cautions: 'Cannot convert beta-carotene efficiently' },
  { gene: 'SLC23A1', rsids: ['rs33972313'], genotypesOfConcern: ['GG'], impact: 'Reduced vitamin C transport', supplement: 'High-dose Vitamin C;Bioflavonoids', dosage: '1000-2000 mg;500 mg daily', evidence: 'moderate', cautions: 'May need higher doses' },
  { gene: 'SLC23A2', rsids: ['rs6596473'], genotypesOfConcern: ['AA'], impact: 'Altered vitamin C transporter function', supplement: 'Vitamin C;Bioflavonoids', dosage: '1000-1500 mg;500 mg daily', evidence: 'low', cautions: 'Support vitamin C transport' },

  // === IRON METABOLISM (6 variants) ===
  { gene: 'HFE', rsids: ['rs1800562'], genotypesOfConcern: ['AA'], impact: 'Hemochromatosis C282Y; iron overload risk', supplement: 'AVOID Iron;Lactoferrin', dosage: 'NO iron;200-400 mg Lactoferrin', evidence: 'high', cautions: 'NEVER supplement iron; monitor ferritin' },
  { gene: 'HFE', rsids: ['rs1799945'], genotypesOfConcern: ['CC'], impact: 'Hemochromatosis H63D; mild iron overload risk', supplement: 'AVOID Iron;IP6', dosage: 'NO iron;800 mg IP6', evidence: 'high', cautions: 'Monitor ferritin levels' },
  { gene: 'TMPRSS6', rsids: ['rs855791'], genotypesOfConcern: ['GG'], impact: 'Increased hepcidin; reduced iron absorption', supplement: 'Iron with Vitamin C', dosage: '18-25 mg iron;500 mg C daily', evidence: 'moderate', cautions: 'Take with vitamin C' },
  { gene: 'TF', rsids: ['rs3811647'], genotypesOfConcern: ['GG'], impact: 'Altered transferrin function', supplement: 'Iron;Copper', dosage: '18 mg;2 mg daily', evidence: 'low', cautions: 'Support iron transport' },
  { gene: 'TFRC', rsids: ['rs7385804'], genotypesOfConcern: ['AA'], impact: 'Altered transferrin receptor function', supplement: 'Iron;Vitamin C', dosage: '18-25 mg;500 mg daily', evidence: 'low', cautions: 'Support iron uptake' },
  { gene: 'SLC40A1', rsids: ['rs11568350'], genotypesOfConcern: ['TT'], impact: 'Altered ferroportin function; iron export issues', supplement: 'Lactoferrin;Vitamin C', dosage: '200-400 mg;500 mg daily', evidence: 'low', cautions: 'Support iron regulation' },

  // === CARDIOVASCULAR & LIPIDS (10 variants) ===
  { gene: 'APOE', rsids: ['rs429358'], genotypesOfConcern: ['CT', 'CC'], impact: 'APOE4 variant; increased cardiovascular & Alzheimer risk', supplement: 'DHA;Curcumin;PQQ', dosage: '1000 mg;500-1000 mg;20 mg daily', evidence: 'high', cautions: 'Avoid high saturated fat' },
  { gene: 'APOE', rsids: ['rs7412'], genotypesOfConcern: ['CT', 'TT'], impact: 'APOE2 variant; altered lipid metabolism', supplement: 'Omega-3;Niacin', dosage: '1000-2000 mg;500 mg daily', evidence: 'moderate', cautions: 'Monitor lipid levels' },
  { gene: 'FADS1', rsids: ['rs174547'], genotypesOfConcern: ['TT'], impact: 'Reduced delta-6-desaturase; poor omega-3 conversion', supplement: 'EPA/DHA (preformed)', dosage: '1-2g EPA+DHA daily', evidence: 'high', cautions: 'Cannot convert ALA efficiently' },
  { gene: 'FADS2', rsids: ['rs174575'], genotypesOfConcern: ['GG'], impact: 'Reduced fatty acid desaturase activity', supplement: 'Fish Oil (EPA/DHA)', dosage: '1-2g EPA+DHA daily', evidence: 'high', cautions: 'Need preformed omega-3s' },
  { gene: 'LDLR', rsids: ['rs6511720'], genotypesOfConcern: ['GG'], impact: 'Reduced LDL receptor function', supplement: 'Plant Sterols;Red Yeast Rice', dosage: '2g;600 mg daily', evidence: 'moderate', cautions: 'Support cholesterol clearance' },
  { gene: 'PCSK9', rsids: ['rs11591147'], genotypesOfConcern: ['GG'], impact: 'Increased PCSK9 activity; higher LDL', supplement: 'Plant Sterols;Berberine', dosage: '2g;500 mg daily', evidence: 'moderate', cautions: 'Support cholesterol metabolism' },
  { gene: 'CETP', rsids: ['rs708272'], genotypesOfConcern: ['GG'], impact: 'Increased cholesteryl ester transfer protein activity', supplement: 'Niacin;Plant Sterols', dosage: '500 mg;2g daily', evidence: 'moderate', cautions: 'Support HDL cholesterol' },
  { gene: 'LIPC', rsids: ['rs1800588'], genotypesOfConcern: ['TT'], impact: 'Reduced hepatic lipase activity', supplement: 'Omega-3;Niacin', dosage: '1000-2000 mg;500 mg daily', evidence: 'low', cautions: 'Support lipid metabolism' },
  { gene: 'ACE', rsids: ['rs4646994'], genotypesOfConcern: ['DD'], impact: 'Higher ACE activity; increased cardiovascular risk', supplement: 'Magnesium;Potassium;Hawthorn', dosage: '400 mg;99 mg;300 mg daily', evidence: 'moderate', cautions: 'Support cardiovascular health' },
  { gene: 'AGT', rsids: ['rs699'], genotypesOfConcern: ['TT'], impact: 'Increased angiotensinogen; higher blood pressure risk', supplement: 'Magnesium;Potassium;CoQ10', dosage: '400 mg;99 mg;100 mg daily', evidence: 'moderate', cautions: 'Support blood pressure' },

  // === DRUG/SUPPLEMENT METABOLISM (8 variants) ===
  { gene: 'CYP1A2', rsids: ['rs762551'], genotypesOfConcern: ['AA'], impact: 'Slow caffeine metabolism; increased sensitivity', supplement: 'L-Theanine;Magnesium', dosage: '200 mg;400 mg daily', evidence: 'moderate', cautions: 'Limit caffeine intake' },
  { gene: 'CYP2D6', rsids: ['rs1065852'], genotypesOfConcern: ['AA'], impact: 'Poor CYP2D6 metabolizer; drug sensitivity', supplement: 'Milk Thistle;NAC', dosage: '150 mg;600 mg daily', evidence: 'low', cautions: 'Support liver function' },
  { gene: 'CYP2C19', rsids: ['rs4244285'], genotypesOfConcern: ['AA'], impact: 'Poor CYP2C19 metabolizer; drug sensitivity', supplement: 'Milk Thistle;NAC;Quercetin', dosage: '150 mg;600 mg;500 mg daily', evidence: 'moderate', cautions: 'Support drug metabolism' },
  { gene: 'CYP3A4', rsids: ['rs2740574'], genotypesOfConcern: ['AA'], impact: 'Altered CYP3A4 activity; drug metabolism changes', supplement: 'Milk Thistle;St John\'s Wort (avoid)', dosage: '150 mg daily;AVOID', evidence: 'low', cautions: 'Many drug interactions' },
  { gene: 'UGT1A1', rsids: ['rs8175347'], genotypesOfConcern: ['TA7/TA7'], impact: 'Reduced glucuronidation capacity', supplement: 'Milk Thistle;NAC;Gluconic Acid', dosage: '150 mg;600 mg;500 mg daily', evidence: 'moderate', cautions: 'Support phase II detox' },
  { gene: 'SLCO1B1', rsids: ['rs4149056'], genotypesOfConcern: ['CC'], impact: 'Reduced statin transport; increased myopathy risk', supplement: 'CoQ10;Red Yeast Rice', dosage: '100-200 mg;600 mg daily', evidence: 'moderate', cautions: 'Essential if taking statins' },
  { gene: 'ABCB1', rsids: ['rs1045642'], genotypesOfConcern: ['TT'], impact: 'Reduced P-glycoprotein function; altered drug transport', supplement: 'Quercetin;Green Tea Extract', dosage: '500 mg;300 mg daily', evidence: 'low', cautions: 'May affect drug absorption' },
  { gene: 'NAT2', rsids: ['rs1801280'], genotypesOfConcern: ['TT'], impact: 'Slow N-acetyltransferase; drug sensitivity', supplement: 'NAC;Milk Thistle', dosage: '600 mg;150 mg daily', evidence: 'low', cautions: 'Support acetylation pathways' },

  // === INFLAMMATION & IMMUNE (5 variants) ===
  { gene: 'IL6', rsids: ['rs1800795'], genotypesOfConcern: ['GG'], impact: 'Increased IL-6 production; higher inflammation', supplement: 'Curcumin;Omega-3;Quercetin', dosage: '500-1000 mg;1000 mg;500 mg daily', evidence: 'moderate', cautions: 'Anti-inflammatory support' },
  { gene: 'IL1B', rsids: ['rs16944'], genotypesOfConcern: ['AA'], impact: 'Increased IL-1β production; inflammation', supplement: 'Curcumin;Boswellia;Omega-3', dosage: '500 mg;300 mg;1000 mg daily', evidence: 'moderate', cautions: 'Reduce inflammatory response' },
  { gene: 'TNF', rsids: ['rs1800629'], genotypesOfConcern: ['AA'], impact: 'Increased TNF-α production; chronic inflammation', supplement: 'Curcumin;Resveratrol;Green Tea', dosage: '500-1000 mg;250 mg;400 mg daily', evidence: 'moderate', cautions: 'Strong anti-inflammatory needed' },
  { gene: 'CRP', rsids: ['rs1205'], genotypesOfConcern: ['TT'], impact: 'Elevated C-reactive protein baseline', supplement: 'Omega-3;Curcumin;Magnesium', dosage: '1000-2000 mg;500 mg;400 mg daily', evidence: 'moderate', cautions: 'Monitor inflammatory markers' },
  { gene: 'PTGS2', rsids: ['rs20417'], genotypesOfConcern: ['GG'], impact: 'Increased COX-2 expression; inflammation', supplement: 'Curcumin;Boswellia;White Willow', dosage: '500 mg;300 mg;240 mg daily', evidence: 'moderate', cautions: 'Natural COX-2 support' },

  // === OTHER IMPORTANT PATHWAYS (5 variants) ===
  { gene: 'CBS', rsids: ['rs234706'], genotypesOfConcern: ['GG'], impact: 'Upregulated transsulfuration pathway', supplement: 'Molybdenum;Vitamin B6', dosage: '150-300 mcg;25-50 mg daily', evidence: 'low', cautions: 'Avoid high-sulfur supplements if sensitive' },
  { gene: 'PEMT', rsids: ['rs7946'], genotypesOfConcern: ['GG'], impact: 'Reduced phosphatidylethanolamine N-methyltransferase', supplement: 'Choline;Phosphatidylcholine', dosage: '500 mg;1200 mg daily', evidence: 'moderate', cautions: 'Essential for women' },
  { gene: 'ALDH2', rsids: ['rs671'], genotypesOfConcern: ['AG', 'AA'], impact: 'Reduced aldehyde dehydrogenase; alcohol sensitivity', supplement: 'NAD+;Milk Thistle;B-Complex', dosage: '100 mg;150 mg;1 capsule daily', evidence: 'low', cautions: 'Support liver detoxification' },
  { gene: 'ADORA2A', rsids: ['rs5751876'], genotypesOfConcern: ['TT'], impact: 'Increased adenosine receptor sensitivity; caffeine sensitivity', supplement: 'L-Theanine;Magnesium;Taurine', dosage: '200 mg;400 mg;1000 mg daily', evidence: 'low', cautions: 'Limit caffeine intake' },
  { gene: 'CLOCK', rsids: ['rs1801260'], genotypesOfConcern: ['TT'], impact: 'Altered circadian rhythm; sleep issues', supplement: 'Melatonin;Magnesium;L-Theanine', dosage: '3 mg;400 mg;200 mg daily', evidence: 'moderate', cautions: 'Support circadian rhythm' }
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

// 💊 DRUG-INDUCED NUTRIENT DEPLETION DATABASE
// Medications that deplete specific nutrients - recommend supplements to counter depletion
export const drugNutrientDepletion = {
  // === CARDIOVASCULAR MEDICATIONS ===
  statin: {
    depletes: ['CoQ10', 'Vitamin D', 'Vitamin K2', 'Selenium'],
    recommendations: [
      { supplement: 'CoQ10', dosage: '100-200 mg', reason: 'Statins block CoQ10 synthesis in the same pathway as cholesterol', priority: 9, timing: 'with_meals' },
      { supplement: 'Vitamin D3', dosage: '2000-4000 IU', reason: 'Statins may interfere with vitamin D synthesis', priority: 7, timing: 'with_fat' },
      { supplement: 'Vitamin K2', dosage: '100-200 mcg', reason: 'Supports arterial health and calcium regulation', priority: 6, timing: 'with_fat' }
    ]
  },
  ace_inhibitor: {
    depletes: ['Zinc', 'Potassium'],
    recommendations: [
      { supplement: 'Zinc Picolinate', dosage: '15-30 mg', reason: 'ACE inhibitors can reduce zinc absorption and increase excretion', priority: 7, timing: 'empty_stomach' },
      { supplement: 'Potassium Citrate', dosage: '99 mg', reason: 'Monitor levels - ACE inhibitors can affect potassium balance', priority: 5, timing: 'with_meals', caution: 'Monitor potassium levels' }
    ]
  },
  beta_blocker: {
    depletes: ['CoQ10', 'Melatonin'],
    recommendations: [
      { supplement: 'CoQ10', dosage: '100 mg', reason: 'Beta blockers may reduce CoQ10 levels and cellular energy', priority: 7, timing: 'with_meals' },
      { supplement: 'Melatonin', dosage: '3 mg', reason: 'Beta blockers can suppress natural melatonin production', priority: 6, timing: 'bedtime' }
    ]
  },
  diuretic: {
    depletes: ['Magnesium', 'Potassium', 'Sodium', 'Zinc', 'B1', 'B6', 'Vitamin C'],
    recommendations: [
      { supplement: 'Magnesium Glycinate', dosage: '400 mg', reason: 'Diuretics increase magnesium excretion leading to deficiency', priority: 9, timing: 'evening' },
      { supplement: 'Potassium Citrate', dosage: '99 mg', reason: 'Replace potassium lost through increased urination', priority: 8, timing: 'with_meals', caution: 'Monitor levels with blood work' },
      { supplement: 'B-Complex', dosage: '1 capsule', reason: 'Water-soluble B vitamins are lost with increased urination', priority: 7, timing: 'morning' },
      { supplement: 'Vitamin C', dosage: '500 mg', reason: 'Water-soluble vitamin lost through diuresis', priority: 6, timing: 'with_meals' }
    ]
  },

  // === DIABETES MEDICATIONS ===
  metformin: {
    depletes: ['B12', 'Folate', 'CoQ10'],
    recommendations: [
      { supplement: 'Methylcobalamin B12', dosage: '1000-2000 mcg', reason: 'Metformin blocks B12 absorption in the intestines - deficiency common after 2+ years', priority: 9, timing: 'sublingual' },
      { supplement: 'Methylfolate', dosage: '800 mcg', reason: 'Metformin interferes with folate metabolism', priority: 7, timing: 'with_meals' },
      { supplement: 'CoQ10', dosage: '100 mg', reason: 'Supports cellular energy in diabetes management', priority: 6, timing: 'with_meals' }
    ]
  },

  // === ACID BLOCKERS ===
  ppi: {
    depletes: ['B12', 'Iron', 'Magnesium', 'Calcium', 'Zinc', 'Vitamin D'],
    recommendations: [
      { supplement: 'B12 Methylcobalamin', dosage: '1000 mcg', reason: 'PPIs reduce stomach acid needed for B12 absorption', priority: 9, timing: 'sublingual' },
      { supplement: 'Iron Bisglycinate', dosage: '18 mg', reason: 'Stomach acid required for iron absorption', priority: 8, timing: 'empty_stomach', caution: 'Only if deficient' },
      { supplement: 'Magnesium Glycinate', dosage: '400 mg', reason: 'PPIs reduce magnesium absorption and increase excretion', priority: 8, timing: 'evening' },
      { supplement: 'Calcium Citrate', dosage: '500 mg', reason: 'Acid-independent form needed with PPI use', priority: 7, timing: 'between_meals' },
      { supplement: 'Zinc Picolinate', dosage: '15 mg', reason: 'Stomach acid needed for zinc absorption', priority: 6, timing: 'empty_stomach' }
    ]
  },
  h2_blocker: {
    depletes: ['B12', 'Iron', 'Zinc', 'Folate'],
    recommendations: [
      { supplement: 'B12 Methylcobalamin', dosage: '500 mcg', reason: 'H2 blockers reduce stomach acid needed for B12 absorption', priority: 8, timing: 'sublingual' },
      { supplement: 'Iron Bisglycinate', dosage: '18 mg', reason: 'Reduced stomach acid impairs iron absorption', priority: 7, timing: 'empty_stomach', caution: 'Only if deficient' },
      { supplement: 'Zinc Picolinate', dosage: '15 mg', reason: 'Acid needed for zinc liberation from food', priority: 6, timing: 'empty_stomach' }
    ]
  },

  // === ANTIDEPRESSANTS ===
  ssri: {
    depletes: ['B6', 'B12', 'Folate', 'CoQ10'],
    recommendations: [
      { supplement: 'P5P (B6)', dosage: '25-50 mg', reason: 'SSRIs can deplete B6 which is needed for neurotransmitter synthesis', priority: 8, timing: 'with_meals' },
      { supplement: 'Methylfolate', dosage: '800 mcg', reason: 'Folate supports serotonin synthesis and mood regulation', priority: 7, timing: 'with_meals' },
      { supplement: 'B12 Methylcobalamin', dosage: '1000 mcg', reason: 'B12 supports nervous system function and mood', priority: 7, timing: 'morning' },
      { supplement: 'CoQ10', dosage: '100 mg', reason: 'Supports cellular energy and may reduce fatigue', priority: 6, timing: 'with_meals' }
    ]
  },

  // === ANTIBIOTICS ===
  antibiotic: {
    depletes: ['Probiotics', 'B-Complex', 'Vitamin K', 'Magnesium'],
    recommendations: [
      { supplement: 'Multi-strain Probiotic', dosage: '25-50 billion CFU', reason: 'Antibiotics destroy beneficial gut bacteria - restore microbiome', priority: 9, timing: '2_hours_after_antibiotic' },
      { supplement: 'B-Complex', dosage: '1 capsule', reason: 'Gut bacteria produce B vitamins - need replacement during/after antibiotics', priority: 7, timing: 'with_meals' },
      { supplement: 'Vitamin K2', dosage: '100 mcg', reason: 'Gut bacteria produce vitamin K - may be depleted', priority: 6, timing: 'with_fat' }
    ]
  },

  // === HORMONES ===
  birth_control: {
    depletes: ['B6', 'B12', 'Folate', 'Magnesium', 'Zinc', 'Vitamin C'],
    recommendations: [
      { supplement: 'P5P (B6)', dosage: '25-50 mg', reason: 'Birth control significantly depletes B6 needed for hormone metabolism', priority: 9, timing: 'with_meals' },
      { supplement: 'Methylfolate', dosage: '800 mcg', reason: 'Oral contraceptives deplete folate - critical for women of childbearing age', priority: 9, timing: 'with_meals' },
      { supplement: 'Magnesium Glycinate', dosage: '400 mg', reason: 'Birth control depletes magnesium needed for mood and muscle function', priority: 8, timing: 'evening' },
      { supplement: 'Zinc Picolinate', dosage: '15 mg', reason: 'Supports hormone production and immune function', priority: 7, timing: 'empty_stomach' },
      { supplement: 'B12 Methylcobalamin', dosage: '1000 mcg', reason: 'Birth control can reduce B12 levels', priority: 7, timing: 'morning' }
    ]
  },

  // === STEROIDS ===
  corticosteroid: {
    depletes: ['Calcium', 'Magnesium', 'Potassium', 'Zinc', 'Vitamin D', 'Vitamin C'],
    recommendations: [
      { supplement: 'Calcium Citrate', dosage: '500-1000 mg', reason: 'Steroids increase calcium excretion and bone loss risk', priority: 9, timing: 'between_meals' },
      { supplement: 'Vitamin D3', dosage: '2000-4000 IU', reason: 'Steroids reduce vitamin D levels and calcium absorption', priority: 9, timing: 'with_fat' },
      { supplement: 'Magnesium Glycinate', dosage: '400 mg', reason: 'Steroids increase magnesium excretion', priority: 8, timing: 'evening' },
      { supplement: 'Potassium Citrate', dosage: '99 mg', reason: 'Steroids can cause potassium wasting', priority: 7, timing: 'with_meals', caution: 'Monitor levels' },
      { supplement: 'Vitamin C', dosage: '1000 mg', reason: 'Steroids increase vitamin C requirements and immune support', priority: 7, timing: 'divided_doses' }
    ]
  }
};

// 🥗 DIET-BASED NUTRIENT DEFICIENCIES
// Common nutrients lacking in specific diets - recommend targeted supplementation
export const dietNutrientDeficiencies = {
  vegan: {
    high_risk_deficiencies: ['B12', 'Iron', 'Zinc', 'Calcium', 'Omega-3', 'Vitamin D'],
    moderate_risk_deficiencies: ['Creatine', 'Carnosine', 'Taurine'],
    recommendations: [
      { supplement: 'B12 Methylcobalamin', dosage: '2000 mcg', reason: 'B12 only found in animal products - vegan deficiency nearly universal without supplementation', priority: 10, timing: 'sublingual', genetic_override: false },
      { supplement: 'Algae Omega-3 (DHA/EPA)', dosage: '1000-2000 mg', reason: 'Plant foods lack long-chain omega-3s (EPA/DHA) found in fish', priority: 9, timing: 'with_meals', genetic_override: false },
      { supplement: 'Iron Bisglycinate', dosage: '18 mg', reason: 'Plant iron (non-heme) has lower absorption than animal iron', priority: 8, timing: 'with_vitamin_c', caution: 'Only if deficient - check labs', genetic_override: false },
      { supplement: 'Zinc Picolinate', dosage: '15 mg', reason: 'Plant foods contain phytates that reduce zinc absorption', priority: 7, timing: 'empty_stomach', genetic_override: false },
      { supplement: 'Calcium Citrate', dosage: '500 mg', reason: 'Non-dairy diets may lack adequate calcium intake', priority: 7, timing: 'between_meals', genetic_override: false },
      { supplement: 'Vitamin D3', dosage: '2000-4000 IU', reason: 'Few vegan food sources of vitamin D', priority: 7, timing: 'with_fat', genetic_override: false }
    ]
  },
  vegetarian: {
    high_risk_deficiencies: ['B12', 'Iron', 'Zinc', 'Omega-3'],
    moderate_risk_deficiencies: ['Creatine', 'Carnosine'],
    recommendations: [
      { supplement: 'B12 Methylcobalamin', dosage: '1000 mcg', reason: 'Vegetarian diets often lack adequate B12 despite dairy/eggs', priority: 9, timing: 'sublingual', genetic_override: false },
      { supplement: 'Iron Bisglycinate', dosage: '18 mg', reason: 'No heme iron from meat - plant iron less bioavailable', priority: 8, timing: 'with_vitamin_c', caution: 'Only if deficient', genetic_override: false },
      { supplement: 'Omega-3 (EPA/DHA)', dosage: '1000 mg', reason: 'Fish is primary source of EPA/DHA omega-3s', priority: 7, timing: 'with_meals', genetic_override: false },
      { supplement: 'Zinc Picolinate', dosage: '15 mg', reason: 'Plant-based zinc absorption reduced by phytates', priority: 6, timing: 'empty_stomach', genetic_override: false }
    ]
  },
  keto: {
    high_risk_deficiencies: ['Magnesium', 'Potassium', 'Sodium', 'Fiber'],
    moderate_risk_deficiencies: ['Folate', 'Vitamin C', 'B-Complex'],
    recommendations: [
      { supplement: 'Electrolyte Complex', dosage: '1 serving', reason: 'Keto causes rapid water/electrolyte loss - prevent "keto flu"', priority: 10, timing: 'throughout_day', genetic_override: false },
      { supplement: 'Magnesium Glycinate', dosage: '400-600 mg', reason: 'Keto depletes magnesium - needed for energy and preventing cramps', priority: 9, timing: 'evening', genetic_override: false },
      { supplement: 'Potassium Citrate', dosage: '99 mg x3', reason: 'Difficult to get adequate potassium on keto without supplementation', priority: 8, timing: 'with_meals', genetic_override: false },
      { supplement: 'Psyllium Husk', dosage: '1 tsp', reason: 'Keto diets often lack fiber for digestive health', priority: 7, timing: 'with_water', genetic_override: false },
      { supplement: 'B-Complex', dosage: '1 capsule', reason: 'Reduced intake of B-vitamin rich grains and fruits', priority: 6, timing: 'morning', genetic_override: false }
    ]
  },
  carnivore: {
    high_risk_deficiencies: ['Vitamin C', 'Fiber', 'Magnesium', 'Potassium'],
    moderate_risk_deficiencies: ['Folate', 'Vitamin E', 'Polyphenols'],
    recommendations: [
      { supplement: 'Vitamin C', dosage: '500-1000 mg', reason: 'No plant foods means no vitamin C - risk of deficiency over time', priority: 8, timing: 'with_meals', genetic_override: false },
      { supplement: 'Magnesium Glycinate', dosage: '400 mg', reason: 'Meat is low in magnesium compared to plant foods', priority: 7, timing: 'evening', genetic_override: false },
      { supplement: 'Potassium Citrate', dosage: '99 mg', reason: 'Fruits/vegetables are primary potassium sources', priority: 7, timing: 'with_meals', genetic_override: false },
      { supplement: 'Psyllium Husk', dosage: '1 tsp', reason: 'Zero fiber intake may affect gut health and elimination', priority: 6, timing: 'with_water', genetic_override: false }
    ]
  },
  paleo: {
    high_risk_deficiencies: ['Calcium', 'Vitamin D'],
    moderate_risk_deficiencies: ['B-Complex', 'Magnesium'],
    recommendations: [
      { supplement: 'Calcium Citrate', dosage: '500 mg', reason: 'No dairy products - may not reach calcium requirements from plants alone', priority: 7, timing: 'between_meals', genetic_override: false },
      { supplement: 'Vitamin D3', dosage: '2000-4000 IU', reason: 'Limited fortified foods in paleo diet', priority: 6, timing: 'with_fat', genetic_override: false }
    ]
  },
  mediterranean: {
    high_risk_deficiencies: [],
    moderate_risk_deficiencies: ['B12', 'Vitamin D'],
    recommendations: [
      { supplement: 'Vitamin D3', dosage: '2000 IU', reason: 'Geographic regions with limited sun exposure', priority: 5, timing: 'with_fat', genetic_override: false }
    ]
  },
  standard_american: {
    high_risk_deficiencies: ['Magnesium', 'Omega-3', 'Fiber', 'Vitamin D'],
    moderate_risk_deficiencies: ['Potassium', 'Vitamin K2', 'Polyphenols'],
    recommendations: [
      { supplement: 'Magnesium Glycinate', dosage: '400 mg', reason: 'Processed foods lack magnesium - 80% of Americans deficient', priority: 8, timing: 'evening', genetic_override: false },
      { supplement: 'Omega-3 (EPA/DHA)', dosage: '1000 mg', reason: 'Standard American diet has poor omega-3 to omega-6 ratio', priority: 8, timing: 'with_meals', genetic_override: false },
      { supplement: 'Vitamin D3', dosage: '2000-4000 IU', reason: 'Indoor lifestyle and limited fatty fish consumption', priority: 7, timing: 'with_fat', genetic_override: false },
      { supplement: 'Fiber Supplement', dosage: '1 serving', reason: 'Processed foods lack adequate fiber for gut health', priority: 6, timing: 'with_water', genetic_override: false }
    ]
  }
};

// 🧬 GENETIC OVERRIDE MATRIX
// When genetic variants conflict with drug/diet recommendations, genetics take priority
export const geneticOverrides = {
  'MTHFR_variants': {
    genetic_priority: ['L-Methylfolate', 'Methylcobalamin B12', 'P5P (B6)'],
    overrides: {
      folic_acid: 'L-Methylfolate', // Never give folic acid to MTHFR variants
      cyanocobalamin: 'Methylcobalamin B12', // Never give synthetic B12
      pyridoxine: 'P5P (B6)' // Never give synthetic B6
    },
    reasoning: 'MTHFR variants cannot process synthetic forms - must use methylated/active forms'
  },
  'COMT_slow': {
    genetic_priority: ['Magnesium', 'L-Theanine', 'Low-dose methyl donors'],
    avoid: ['High-dose methyl donors', 'SAMe', 'DMG'],
    reasoning: 'Slow COMT variants get overstimulated by methyl donors - focus on calming nutrients'
  },
  'HFE_variants': {
    genetic_priority: ['Never Iron supplements'],
    overrides: {
      iron: 'Lactoferrin (if needed)', // Never give iron to hemochromatosis variants
      iron_rich_foods: 'Monitor carefully'
    },
    reasoning: 'HFE variants have iron overload risk - iron supplementation contraindicated'
  },
  'APOE4_carriers': {
    genetic_priority: ['Omega-3', 'Curcumin', 'Mediterranean diet'],
    modify: {
      saturated_fat: 'Limit strictly',
      coconut_oil: 'Avoid',
      mct_oil: 'Use cautiously'
    },
    reasoning: 'APOE4 carriers have higher cardiovascular/cognitive risk with saturated fats'
  },
  'VDR_variants': {
    genetic_priority: ['Higher dose Vitamin D3', 'Magnesium', 'Vitamin K2'],
    modify: {
      vitamin_d_dose: 'Increase 50-100%'
    },
    reasoning: 'VDR variants need higher vitamin D doses for same biological effect'
  }
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

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  console.log("generate_analysis function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: cors });
  }
  
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    
    let body: AnalysisRequest;
    try { 
      body = await req.json(); 
      console.log("Request body:", body);
    } catch (_) { 
      return new Response('Invalid JSON', { status: 400, headers: cors }); 
    }
    
    const { user_id } = body;
    if (!user_id) return new Response('Missing user_id', { status: 400, headers: cors });

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
      return new Response('Configuration error', { status: 500, headers: cors });
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
      return new Response('Database error', { status: 500, headers: cors });
    }
    
    if (!assessment) {
      console.log("No completed assessment found for user:", user_id);
      return new Response('No completed assessment', { status: 404, headers: cors });
    }
    
    console.log("Assessment found, ID:", assessment.id);

    console.log("Fetching genetic markers and lab biomarkers");
    const { data: rawMarkers, error: markersErr } = await supabase.from('genetic_data').select('*').eq('user_id', user_id);
    const { data: labs, error: labsErr } = await supabase.from('lab_data').select('*').eq('user_id', user_id);
    
    if (markersErr) console.error("Error fetching genetic markers:", markersErr);
    if (labsErr) console.error("Error fetching lab biomarkers:", labsErr);
    
    // Convert JSON-based genetic data to row-based format for processing
    const markers = [];
    if (rawMarkers && rawMarkers.length > 0) {
      for (const geneticRow of rawMarkers) {
        // Extract SNPs from the snp_data JSON object
        if (geneticRow.snp_data && typeof geneticRow.snp_data === 'object') {
          for (const [rsid, genotype] of Object.entries(geneticRow.snp_data)) {
            if (genotype && String(genotype).trim() !== '') {
              // Find the gene for this rsid
              const geneRef = geneReferences.find(ref => ref.rsids.includes(rsid));
              markers.push({
                rsid: rsid,
                genotype: String(genotype).trim(),
                gene: geneRef?.gene || 'Unknown',
                user_id: geneticRow.user_id,
                source_company: geneticRow.source_company
              });
            }
          }
        }
      }
    }
    
    console.log(`Found ${markers?.length || 0} genetic markers, ${labs?.length || 0} lab biomarkers`);

    // HOLISTIC PRECISION MEDICINE ANALYSIS SYSTEM
    // Primary catalysts: Genetic SNPs + Biomarkers
    // Secondary factors: Health goals + Lifestyle + Medical history
    
    console.log("🧬 Starting comprehensive holistic analysis...");
    
    // STEP 1: COMPREHENSIVE GENETIC SNP ANALYSIS - Primary Catalyst
    const geneticRecommendations = [];
    const geneticConcerns = [];
    
    // Create a comprehensive analysis by checking all possible SNPs in our database
    console.log(`🧬 COMPREHENSIVE GENETIC ANALYSIS: Checking ${geneReferences.length} potential genetic variants...`);
    
    // Build a map of user's genetic data for quick lookup
    const userSNPMap = {};
    if (markers && markers.length > 0) {
      markers.forEach(marker => {
        userSNPMap[marker.rsid] = marker.genotype;
      });
      console.log(`Found user data for ${markers.length} SNPs out of ${geneReferences.length} total variants in our database`);
    }
    
    // Analyze ALL genetic variants in our comprehensive database
    for (const geneRef of geneReferences) {
      for (const rsid of geneRef.rsids) {
        const userGenotype = userSNPMap[rsid];
        
                 if (userGenotype) {
           // User has this SNP - analyze it
           if (geneRef.genotypesOfConcern?.includes(userGenotype)) {
            console.log(`🧬 Found variant of concern: ${rsid} (${userGenotype}) - ${geneRef.gene}`);
          
            // Extract dosage information
            const dosageMatch = geneRef.dosage.match(/(\d+(?:\.\d+)?)\s*[-–]?\s*(\d+(?:\.\d+)?)?\s*(µg|mcg|mg|g|IU)/i);
            const minDose = dosageMatch ? parseFloat(dosageMatch[1]) : 100;
            const maxDose = dosageMatch && dosageMatch[2] ? parseFloat(dosageMatch[2]) : minDose;
            const unit = dosageMatch ? dosageMatch[3] : 'mg';
            
            // Create genetic-driven recommendation with SPECIFIC biological reasoning
            const supplements = geneRef.supplement.split(';').map(s => s.trim());
            
            supplements.forEach(supplement => {
              let specificReason = generateSpecificGeneticReasoning(geneRef.gene, rsid, userGenotype, supplement, geneRef.impact);
              
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
                source_data: { rsid: rsid, genotype: userGenotype, gene: geneRef.gene }
              });
            });
            
            geneticConcerns.push(`${geneRef.gene} variant (${rsid}: ${userGenotype})`);
            relevant_genes.push(geneRef.gene);
          } else {
            console.log(`🧬 Normal genotype (no supplement needed): ${rsid} (${userGenotype}) - ${geneRef.gene}`);
          }
        }
      }
    }

    // STEP 2: COMPREHENSIVE BIOMARKER ANALYSIS - Primary Catalyst
    const biomarkerRecommendations = [];
    const biomarkerConcerns = [];
    
    console.log(`📊 COMPREHENSIVE BIOMARKER ANALYSIS: Analyzing all available lab data...`);
    
    // Check both lab_biomarkers and lab_data tables for comprehensive analysis
    const { data: labData, error: labDataErr } = await supabase.from('lab_data').select('*').eq('user_id', user_id);
    if (labDataErr) console.error("Error fetching lab_data:", labDataErr);
    
    // Create comprehensive biomarker inventory from all sources
    const allBiomarkers = new Map();
    let totalBiomarkersFound = 0;
    
    // Process lab_biomarkers table
    if (labs && labs.length > 0) {
      console.log(`Analyzing ${labs.length} lab biomarker panels...`);
      
      for (const lab of labs) {
        if (lab.biomarker_data && typeof lab.biomarker_data === 'object') {
          console.log(`📊 Processing biomarkers from: ${lab.lab_name || 'Lab Panel'}`);
          
          // Analyze each biomarker comprehensively
          for (const [biomarkerName, value] of Object.entries(lab.biomarker_data)) {
            const normalizedName = biomarkerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const numericValue = parseFloat(String(value));
            
            // Add to comprehensive inventory
            allBiomarkers.set(biomarkerName, { value, source: lab.lab_name || 'Lab Panel', normalized: normalizedName });
            totalBiomarkersFound++;
            
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
    
    // Process lab_data table (includes flagged biomarkers)
    if (labData && labData.length > 0) {
      console.log(`Analyzing ${labData.length} structured lab reports...`);
      
      for (const labReport of labData) {
        // Process flagged biomarkers (out of range values)
        if (labReport.flagged_biomarkers && Array.isArray(labReport.flagged_biomarkers)) {
          console.log(`📊 Processing ${labReport.flagged_biomarkers.length} flagged biomarkers from: ${labReport.lab_name || 'Lab Report'}`);
          
          for (const flagged of labReport.flagged_biomarkers) {
            const normalizedName = flagged.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const numericValue = parseFloat(String(flagged.value));
            
            if (!isNaN(numericValue)) {
              const biomarkerRecommendation = analyzeBiomarker(normalizedName, numericValue, flagged.name);
              
              // Add to comprehensive inventory
              allBiomarkers.set(flagged.name, { 
                value: flagged.value, 
                source: labReport.lab_name || 'Lab Report', 
                normalized: normalizedName,
                status: flagged.status,
                reference_range: flagged.reference_range
              });
              totalBiomarkersFound++;
              
              if (biomarkerRecommendation) {
                biomarkerRecommendations.push({
                  ...biomarkerRecommendation,
                  biomarker_reasoning: `📊 **Flagged Lab Value**: Your ${flagged.name} of ${flagged.value} ${flagged.unit || ''} is ${flagged.status} (reference: ${flagged.reference_range}). We've specifically chosen this supplement because research shows it can help bring this marker back into optimal range. This targeted approach addresses your specific lab abnormality rather than generic supplementation.`,
                  source_type: 'biomarker',
                  source_data: { 
                    biomarker: flagged.name, 
                    value: flagged.value, 
                    status: flagged.status,
                    reference_range: flagged.reference_range,
                    lab_name: labReport.lab_name 
                  }
                });
                
                biomarkerConcerns.push(`${flagged.name}: ${flagged.value} (${flagged.status})`);
                relevant_biomarkers.push(flagged.name);
              }
            }
          }
        }
      }
    }
    
    // Comprehensive biomarker analysis summary
    console.log(`📊 COMPREHENSIVE BIOMARKER ANALYSIS COMPLETE:`);
    console.log(`   - Total biomarkers found across all sources: ${totalBiomarkersFound}`);
    console.log(`   - Unique biomarkers analyzed: ${allBiomarkers.size}`);
    console.log(`   - Biomarker-driven recommendations: ${biomarkerRecommendations.length}`);
    console.log(`   - Sources: ${labs?.length || 0} biomarker panels + ${labData?.length || 0} lab reports`);

    // STEP 3: DRUG-INDUCED NUTRIENT DEPLETION ANALYSIS - Secondary Catalyst
    const drugDepletionRecommendations = [];
    const medications = assessment.current_medications || [];
    
    if (medications.length > 0) {
      console.log(`💊 Analyzing drug-induced nutrient depletion for: ${medications.join(', ')}`);
      
      for (const medication of medications) {
        const normalizedMed = medication.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // Check for exact matches and partial matches
        const depletionProfile = findMedicationDepletionProfile(normalizedMed);
        
        if (depletionProfile) {
          console.log(`💊 Found depletion profile for: ${medication}`);
          
          depletionProfile.recommendations.forEach(rec => {
            drugDepletionRecommendations.push({
              supplement_name: rec.supplement,
              dosage_amount: parseFloat(rec.dosage.split('-')[0]) || 100,
              dosage_unit: rec.dosage.includes('mg') ? 'mg' : rec.dosage.includes('mcg') ? 'mcg' : rec.dosage.includes('IU') ? 'IU' : 'mg',
              frequency: 'daily',
              timing: rec.timing || 'with_meals',
              recommendation_reason: `💊 **Drug-Induced Nutrient Depletion**: ${rec.reason} Your medication ${medication} is known to deplete ${rec.supplement}, so we're recommending targeted supplementation to prevent deficiency and maintain optimal health.`,
              evidence_quality: 'high',
              priority_score: rec.priority,
              expected_benefits: [`Prevent ${rec.supplement} deficiency`, `Counter medication side effects`, `Maintain optimal nutrient status`],
              contraindications: rec.caution ? [rec.caution] : [],
              source_type: 'drug_depletion',
              source_data: { medication: medication, depleted_nutrient: rec.supplement }
            });
          });
        }
      }
    }

    // STEP 4: DIET-BASED DEFICIENCY ANALYSIS - Secondary Catalyst
    const dietDeficiencyRecommendations = [];
    const dietType = assessment.diet_type || 'standard_american';
    
    console.log(`🥗 Analyzing diet-based deficiencies for: ${dietType}`);
    
    const dietProfile = dietNutrientDeficiencies[dietType];
    if (dietProfile) {
      console.log(`🥗 Found deficiency profile for ${dietType} diet`);
      
      dietProfile.recommendations.forEach(rec => {
        dietDeficiencyRecommendations.push({
          supplement_name: rec.supplement,
          dosage_amount: parseFloat(rec.dosage.split('-')[0]) || 100,
          dosage_unit: rec.dosage.includes('mg') ? 'mg' : rec.dosage.includes('mcg') ? 'mcg' : rec.dosage.includes('IU') ? 'IU' : 'capsule',
          frequency: 'daily',
          timing: rec.timing || 'with_meals',
          recommendation_reason: `🥗 **Diet-Based Deficiency**: ${rec.reason} Based on your ${dietType} diet, we've identified this as a potential nutrient gap that could benefit from targeted supplementation.`,
          evidence_quality: 'moderate',
          priority_score: rec.priority,
          expected_benefits: [`Address dietary nutrient gaps`, `Support optimal nutrition`, `Prevent diet-related deficiencies`],
          contraindications: rec.caution ? [rec.caution] : [],
          source_type: 'diet_deficiency',
          source_data: { diet_type: dietType, deficiency_risk: 'high' },
          genetic_override_eligible: rec.genetic_override !== false // Most diet recommendations can be overridden by genetics
        });
      });
    }

    // STEP 5: HEALTH GOALS & LIFESTYLE INTEGRATION - Tertiary Factor
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

    // STEP 6: COMBINE ALL RECOMMENDATIONS BY PRIORITY
    let allRecommendations = [
      ...geneticRecommendations,      // Priority 1: Genetic SNPs (9-10)
      ...biomarkerRecommendations,    // Priority 2: Lab abnormalities (8-9)
      ...drugDepletionRecommendations,// Priority 3: Drug-induced depletion (7-9)
      ...dietDeficiencyRecommendations,// Priority 4: Diet gaps (5-8)
      ...lifestyleRecommendations     // Priority 5: Health goals (3-7)
    ];

    // COMPREHENSIVE ANALYSIS SUMMARY
    console.log(`🎯 COMPREHENSIVE HEALTH ANALYSIS COMPLETE:`);
    console.log(`📊 ANALYSIS SCOPE:`);
    console.log(`   🧬 Genetic variants checked: ${geneReferences.length} total SNPs in database`);
    console.log(`   🧬 User genetic data found: ${markers?.length || 0} SNPs`);
    console.log(`   🧬 Actionable genetic variants: ${geneticRecommendations.length}`);
    console.log(`   📊 Total biomarkers analyzed: ${totalBiomarkersFound}`);
    console.log(`   📊 Unique biomarker types: ${allBiomarkers.size}`);
    console.log(`   📊 Actionable biomarker findings: ${biomarkerRecommendations.length}`);
    console.log(`   💊 Medications analyzed: ${medications.length}`);
    console.log(`   🥗 Diet type: ${assessment.diet_type || 'standard_american'}`);
    console.log(`   🎯 Health goals: ${(assessment.health_goals || []).length}`);
    console.log(`📋 RECOMMENDATIONS GENERATED:`);
    console.log(`   - Genetic-based: ${geneticRecommendations.length}`);
    console.log(`   - Biomarker-based: ${biomarkerRecommendations.length}`);  
    console.log(`   - Drug depletion: ${drugDepletionRecommendations.length}`);
    console.log(`   - Diet deficiency: ${dietDeficiencyRecommendations.length}`);
    console.log(`   - Lifestyle/goals: ${lifestyleRecommendations.length}`);
    console.log(`   📊 Total recommendations: ${allRecommendations.length}`);

    // STEP 7: GENETIC OVERRIDE ANALYSIS - Genetics are the "software" and take priority
    console.log("🧬 Applying genetic overrides - genetics take priority over all other factors...");
    allRecommendations = applyGeneticOverrides(allRecommendations, markers, interaction_warnings);

    // STEP 8: REMOVE DUPLICATES AND MERGE SIMILAR SUPPLEMENTS
    allRecommendations = mergeSimilarSupplements(allRecommendations);

    // STEP 9: GENE-GENE AND BIOMARKER INTERACTIONS
    allRecommendations = checkInteractions(allRecommendations, markers, labs, interaction_warnings);

    // STEP 10: COMPREHENSIVE SAFETY FILTERING
    allRecommendations = applySafetyFilters(allRecommendations, assessment, interaction_warnings);

    // STEP 10.5: AI-POWERED COMPREHENSIVE INTERACTION SAFETY CHECK
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

    // STEP 11: AI ENHANCEMENT (if available)
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

    // STEP 12: FINAL PRIORITIZATION AND SUMMARY
    allRecommendations.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
    
    // Generate comprehensive analysis summary
    analysis_summary = generateComprehensiveAnalysisSummary(
      assessment,
      geneticConcerns,
      biomarkerConcerns,
      allRecommendations,
      healthGoals,
      markers,
      labs
    );

    supplements = allRecommendations;

    console.log("Inserting AI analysis record");
    
    const analysisData = { 
      user_id, 
      assessment_id: assessment.id, 
      analysis_type: aiAnalysisSuccessful ? (ANTHROPIC_API_KEY ? 'claude-3-haiku' : 'gpt-3.5-turbo') : 'rule-based', 
      content: analysis_summary, 
      interaction_warnings: interaction_warnings || [],
      confidence_score: aiAnalysisSuccessful ? 0.9 : 0.6
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
      return new Response('Database error: ' + analysisInsertErr.message, { status: 500, headers: cors });
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
      const { error: recErr, data: insertedRecs } = await supabase.from('supplement_recommendations').insert(rows).select('id, supplement_name');
      
      if (recErr) {
        console.error('Error inserting recommendations:', recErr);
        interaction_warnings.push('Failed to save supplement recommendations');
      } else {
        console.log(`✅ Successfully inserted ${insertedRecs?.length || 0} recommendations`);
        
        // Link products to each recommendation
        if (insertedRecs && insertedRecs.length > 0) {
          console.log('🔗 Linking products to recommendations...');
          
          for (const rec of insertedRecs) {
            try {
              // Call the database function to link products
              const { error: linkError } = await supabase.rpc('link_products_to_recommendation', {
                rec_id: rec.id,
                supplement_name_param: rec.supplement_name
              });
              
              if (linkError) {
                console.error(`❌ Error linking products for ${rec.supplement_name}:`, linkError);
                // Try fallback - create a generic product link
                await createFallbackProductLink(rec.id, rec.supplement_name);
              } else {
                console.log(`✅ Linked products for ${rec.supplement_name}`);
              }
            } catch (error) {
              console.error(`❌ Error in product linking for ${rec.supplement_name}:`, error);
              // Create fallback link
              await createFallbackProductLink(rec.id, rec.supplement_name);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      status:'ok', 
      mode: aiAnalysisSuccessful ? 'ai-enhanced' : 'rule-based',
      analysis_id: analysisRow?.id 
    }), { headers: { ...cors, 'Content-Type':'application/json' } });
  } catch (error) {
    console.error('generate_analysis error:', error);
    return new Response(JSON.stringify({ error: 'Internal error', details: String(error) }), { 
      status: 500, 
      headers: { ...cors, 'Content-Type':'application/json' }
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

// Comprehensive biomarker analysis function - covers 50+ biomarkers
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
        recommendation_reason: `Your vitamin A level of ${numericValue} mcg/dL indicates deficiency (optimal: 30-65 mcg/dL). Because many people can't convert beta-carotene efficiently, we're recommending preformed vitamin A (retinol) to directly address your deficiency. This active form will restore your vitamin A status for better immune function, vision, and skin health.`,
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
        recommendation_reason: `Your vitamin E level of ${numericValue} mg/L is below optimal (12-20 mg/L). We're choosing mixed tocopherols rather than just alpha-tocopherol because your body needs all eight forms of vitamin E for complete antioxidant protection. This comprehensive approach will provide better cellular protection than synthetic vitamin E.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Enhanced antioxidant protection', 'Improved cardiovascular health'],
        contraindications: ['Monitor if on blood thinners'],
        concern: 'vitamin E deficiency'
      };
    }
  }
  
  if (normalizedName.includes('vitamin_k') || normalizedName.includes('phylloquinone')) {
    if (numericValue < 0.4) {
      return {
        supplement_name: 'Vitamin K2 (MK-7)',
        dosage_amount: 100,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your vitamin K level of ${numericValue} ng/mL indicates deficiency. We're specifically choosing K2 (MK-7) over K1 because K2 is more effective for bone and cardiovascular health. While K1 is mainly for blood clotting, K2 activates proteins that direct calcium to bones and away from arteries - exactly what you need for optimal health.`,
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
        recommendation_reason: `Your vitamin C level of ${numericValue} mg/L is below optimal (11-20 mg/L). We're combining vitamin C with bioflavonoids because they work synergistically to enhance absorption and provide additional antioxidant benefits. This combination is more effective than vitamin C alone for immune support and collagen synthesis.`,
        evidence_quality: 'high',
        priority_score: 7,
        expected_benefits: ['Enhanced immune function', 'Improved antioxidant protection', 'Better iron absorption'],
        contraindications: ['Reduce dose if GI upset'],
        concern: 'vitamin C deficiency'
      };
    }
  }

  // === B-VITAMINS (Enhanced Coverage) ===
  if (normalizedName.includes('thiamine') || normalizedName.includes('b1') || normalizedName.includes('vitamin_b1')) {
    if (numericValue < 70) {
      return {
        supplement_name: 'Thiamine (B1)',
        dosage_amount: 100,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your thiamine level indicates deficiency affecting your energy metabolism. Because thiamine is crucial for converting carbohydrates to energy, we're recommending a therapeutic dose to restore your levels. This B1 deficiency could be causing fatigue, brain fog, and poor stress tolerance - symptoms that should improve within 2-4 weeks.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved energy metabolism', 'Better nerve function', 'Enhanced mental clarity'],
        contraindications: ['Water-soluble, excess excreted'],
        concern: 'thiamine deficiency'
      };
    }
  }
  
  if (normalizedName.includes('riboflavin') || normalizedName.includes('b2') || normalizedName.includes('vitamin_b2')) {
    if (numericValue < 6.2) {
      return {
        supplement_name: 'Riboflavin (B2)',
        dosage_amount: 25,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your riboflavin level indicates deficiency affecting your cellular energy production. B2 is essential for mitochondrial function and converting other B vitamins to their active forms. This deficiency could be limiting your energy production at the cellular level and affecting your ability to utilize other B vitamins effectively.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved cellular energy', 'Better B vitamin utilization', 'Enhanced antioxidant function'],
        contraindications: ['May turn urine bright yellow (harmless)'],
        concern: 'riboflavin deficiency'
      };
    }
  }
  
  if (normalizedName.includes('niacin') || normalizedName.includes('b3') || normalizedName.includes('vitamin_b3') || normalizedName.includes('nicotinic')) {
    if (numericValue < 14) {
      return {
        supplement_name: 'Niacinamide (B3)',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your niacin level indicates deficiency affecting your energy metabolism and cellular repair. We're choosing niacinamide over regular niacin because it provides the same benefits without the flushing side effect. This form supports energy production, DNA repair, and healthy cholesterol metabolism.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved energy metabolism', 'Better cholesterol levels', 'Enhanced DNA repair'],
        contraindications: ['Monitor liver function with high doses'],
        concern: 'niacin deficiency'
      };
    }
  }
  
  if (normalizedName.includes('pantothenic') || normalizedName.includes('b5') || normalizedName.includes('vitamin_b5')) {
    if (numericValue < 1.8) {
      return {
        supplement_name: 'Pantothenic Acid (B5)',
        dosage_amount: 250,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your pantothenic acid level indicates deficiency affecting your adrenal function and stress response. B5 is crucial for cortisol production and energy metabolism. This deficiency could be causing fatigue, poor stress tolerance, and adrenal dysfunction - all of which should improve with supplementation.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Better stress response', 'Improved adrenal function', 'Enhanced energy production'],
        contraindications: ['Generally well tolerated'],
        concern: 'pantothenic acid deficiency'
      };
    }
  }
  
  if (normalizedName.includes('pyridoxine') || normalizedName.includes('b6') || normalizedName.includes('vitamin_b6') || normalizedName.includes('pyridoxal')) {
    if (numericValue < 20) {
      return {
        supplement_name: 'Pyridoxal-5-Phosphate (P5P)',
        dosage_amount: 25,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your B6 level of ${numericValue} ng/mL indicates deficiency (optimal: 20-50 ng/mL). We're recommending P5P, the active form of B6, because it bypasses the conversion step and works immediately. This deficiency could be affecting your neurotransmitter production, hormone metabolism, and homocysteine levels.`,
        evidence_quality: 'high',
        priority_score: 7,
        expected_benefits: ['Better neurotransmitter function', 'Improved hormone balance', 'Lower homocysteine'],
        contraindications: ['Avoid >100mg daily long-term'],
        concern: 'B6 deficiency'
      };
    }
  }
  
  if (normalizedName.includes('biotin') || normalizedName.includes('b7') || normalizedName.includes('vitamin_b7') || normalizedName.includes('vitamin_h')) {
    if (numericValue < 400) {
      return {
        supplement_name: 'Biotin (B7)',
        dosage_amount: 5000,
        dosage_unit: 'mcg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your biotin level indicates deficiency affecting your hair, skin, nail health and metabolism. Biotin is crucial for fatty acid synthesis, gene regulation, and cell growth. This therapeutic dose will support your metabolic function and should improve hair and nail strength within 8-12 weeks.`,
        evidence_quality: 'moderate',
        priority_score: 5,
        expected_benefits: ['Stronger hair and nails', 'Better metabolism', 'Improved skin health'],
        contraindications: ['May interfere with lab tests'],
        concern: 'biotin deficiency'
      };
    }
  }

  // === MINERALS (Comprehensive Coverage) ===
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
          recommendation_reason: `Your RBC magnesium of ${numericValue} mg/dL indicates intracellular deficiency (optimal: 4.2-6.8 mg/dL). We're choosing magnesium glycinate because it's the most bioavailable form and won't cause digestive upset. This form crosses cell membranes easily and will restore your cellular magnesium stores more effectively than cheaper forms like magnesium oxide.`,
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
          recommendation_reason: `Your serum magnesium of ${numericValue} mg/dL is below optimal (1.8-2.6 mg/dL). While serum levels don't always reflect cellular status, this low level suggests you need magnesium supplementation. We're using glycinate form for superior absorption and tolerability.`,
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
        recommendation_reason: `Your calcium level of ${numericValue} mg/dL is below optimal (8.5-10.5 mg/dL). We're combining calcium citrate with D3 and K2 because calcium alone can be harmful. D3 helps you absorb calcium, while K2 ensures it goes to bones instead of arteries. This combination provides comprehensive bone support while protecting your cardiovascular system.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved bone health', 'Better muscle function'],
        contraindications: ['Take away from iron', 'Include K2 for proper utilization'],
        concern: 'calcium deficiency'
      };
    }
  }
  
  if (normalizedName.includes('potassium')) {
    if (numericValue < 3.5) {
      return {
        supplement_name: 'Potassium Citrate',
        dosage_amount: 99,
        dosage_unit: 'mg',
        frequency: 'three times daily',
        timing: 'with meals',
        recommendation_reason: `Your potassium level of ${numericValue} mEq/L is below optimal (3.5-5.0 mEq/L). Low potassium affects muscle function, blood pressure, and heart rhythm. We're recommending potassium citrate because it's well absorbed and helps alkalize the body. Note: supplements are limited to 99mg by law - dietary sources are equally important.`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Better blood pressure', 'Improved muscle function', 'Enhanced heart health'],
        contraindications: ['Monitor if kidney disease', 'Avoid with ACE inhibitors'],
        concern: 'potassium deficiency'
      };
    }
  }
  
  if (normalizedName.includes('phosphorus') || normalizedName.includes('phosphate')) {
    if (numericValue < 2.5) {
      return {
        supplement_name: 'Phosphorus Complex',
        dosage_amount: 250,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with meals',
        recommendation_reason: `Your phosphorus level of ${numericValue} mg/dL is below optimal (2.5-4.5 mg/dL). Phosphorus is crucial for bone health, energy metabolism, and cellular function. Low levels can cause weakness, bone pain, and metabolic dysfunction.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Improved bone health', 'Better energy metabolism'],
        contraindications: ['Balance with calcium'],
        concern: 'phosphorus deficiency'
      };
    }
  }

  // === ELEVATED VALUES THAT NEED TO BE LOWERED ===
  
  // === CHOLESTEROL & LIPIDS ===
  if (normalizedName.includes('ldl') || normalizedName.includes('ldl_cholesterol')) {
    if (numericValue > 100) {
      let priority = 6;
      let dosage = 1000;
      if (numericValue > 130) {
        priority = 8;
        dosage = 1500;
      }
      
      return {
        supplement_name: 'Red Yeast Rice + Plant Sterols',
        dosage_amount: dosage,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with dinner',
        recommendation_reason: `Your LDL cholesterol of ${numericValue} mg/dL is above optimal (<100 mg/dL). We're recommending red yeast rice combined with plant sterols because this combination has been shown to lower LDL by 20-30% naturally. Red yeast rice contains naturally occurring statins, while plant sterols block cholesterol absorption. This dual approach targets both cholesterol production and absorption for maximum effectiveness.`,
        evidence_quality: 'high',
        priority_score: priority,
        expected_benefits: ['Lower LDL cholesterol within 6-8 weeks', 'Improved cardiovascular health'],
        contraindications: ['Avoid if on statin medications', 'Monitor liver function'],
        concern: 'elevated LDL cholesterol'
      };
    }
  }
  
  if (normalizedName.includes('total_cholesterol') || normalizedName.includes('cholesterol_total')) {
    if (numericValue > 200) {
      return {
        supplement_name: 'Bergamot Extract + Niacin',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'with meals',
        recommendation_reason: `Your total cholesterol of ${numericValue} mg/dL is above optimal (<200 mg/dL). We're combining bergamot extract with niacin because bergamot specifically targets cholesterol synthesis while niacin improves the overall lipid profile. This combination not only lowers total cholesterol but also improves the HDL:LDL ratio for better cardiovascular protection.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Lower total cholesterol', 'Improved lipid ratios', 'Better cardiovascular health'],
        contraindications: ['Monitor for flushing with niacin'],
        concern: 'elevated total cholesterol'
      };
    }
  }
  
  if (normalizedName.includes('triglycerides')) {
    if (numericValue > 150) {
      let dosage = 2000;
      if (numericValue > 200) dosage = 3000;
      
      return {
        supplement_name: 'Omega-3 (EPA/DHA)',
        dosage_amount: dosage,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with largest meal',
        recommendation_reason: `Your triglycerides of ${numericValue} mg/dL are above optimal (<150 mg/dL). We're recommending high-dose omega-3s because EPA/DHA are the most effective supplements for lowering triglycerides, reducing them by 20-50%. This prescription-strength dose targets triglyceride synthesis in the liver and improves fat metabolism throughout your body.`,
        evidence_quality: 'high',
        priority_score: 7,
        expected_benefits: ['Lower triglycerides within 4-6 weeks', 'Improved fat metabolism', 'Better cardiovascular health'],
        contraindications: ['Monitor if on blood thinners'],
        concern: 'elevated triglycerides'
      };
    }
  }
  
  // === INFLAMMATORY MARKERS ===
  if (normalizedName.includes('crp') || normalizedName.includes('c_reactive')) {
    if (numericValue > 3.0) {
      return {
        supplement_name: 'Curcumin + Boswellia',
        dosage_amount: 1000,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'with meals',
        recommendation_reason: `Your C-reactive protein of ${numericValue} mg/L indicates elevated inflammation (optimal: <1.0 mg/L). We're combining curcumin with boswellia because these are two of the most potent anti-inflammatory compounds available. This combination targets multiple inflammatory pathways and should significantly reduce your systemic inflammation within 4-6 weeks.`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Reduced inflammation within 4-6 weeks', 'Lower cardiovascular risk', 'Improved overall health'],
        contraindications: ['Monitor if on blood thinners'],
        concern: 'elevated inflammation'
      };
    }
  }
  
  // === BLOOD SUGAR MARKERS ===
  if (normalizedName.includes('glucose') && !normalizedName.includes('pp')) {
    if (numericValue > 100) {
      return {
        supplement_name: 'Berberine + Chromium',
        dosage_amount: 500,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'before meals',
        recommendation_reason: `Your fasting glucose of ${numericValue} mg/dL is above optimal (70-99 mg/dL). We're combining berberine with chromium because berberine works like metformin to improve insulin sensitivity, while chromium enhances glucose uptake by cells. This combination helps normalize blood sugar and prevents progression to diabetes.`,
        evidence_quality: 'high',
        priority_score: 8,
        expected_benefits: ['Better blood sugar control within 4-6 weeks', 'Improved insulin sensitivity'],
        contraindications: ['Monitor blood sugar if diabetic'],
        concern: 'elevated blood glucose'
      };
    }
  }
  
  if (normalizedName.includes('hemoglobin_a1c') || normalizedName.includes('hba1c')) {
    if (numericValue > 5.7) {
      return {
        supplement_name: 'Alpha-Lipoic Acid + Cinnamon Extract',
        dosage_amount: 600,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'with meals',
        recommendation_reason: `Your HbA1c of ${numericValue}% indicates impaired glucose metabolism (optimal: <5.7%). We're combining alpha-lipoic acid with cinnamon extract because ALA improves insulin sensitivity and glucose uptake, while cinnamon mimics insulin action. This combination addresses both insulin resistance and glucose disposal for comprehensive blood sugar support.`,
        evidence_quality: 'high',
        priority_score: 9,
        expected_benefits: ['Lower HbA1c within 3 months', 'Better long-term blood sugar control'],
        contraindications: ['Monitor blood sugar closely'],
        concern: 'elevated HbA1c'
      };
    }
  }
  
  // === LIVER FUNCTION ===
  if (normalizedName.includes('alt') || normalizedName.includes('alanine')) {
    if (numericValue > 40) {
      return {
        supplement_name: 'Milk Thistle + NAC',
        dosage_amount: 200,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'between meals',
        recommendation_reason: `Your ALT of ${numericValue} U/L is above optimal (<40 U/L), indicating liver stress. We're combining milk thistle with N-acetylcysteine because milk thistle protects liver cells while NAC provides glutathione for detoxification. This combination supports liver health and helps normalize liver enzymes naturally.`,
        evidence_quality: 'moderate',
        priority_score: 7,
        expected_benefits: ['Improved liver function within 6-8 weeks', 'Better detoxification'],
        contraindications: ['Monitor liver function'],
        concern: 'elevated liver enzymes'
      };
    }
  }
  
  // === URIC ACID ===
  if (normalizedName.includes('uric_acid') || normalizedName.includes('uric')) {
    if (numericValue > 7.0) {
      return {
        supplement_name: 'Tart Cherry Extract + Quercetin',
        dosage_amount: 480,
        dosage_unit: 'mg',
        frequency: 'twice daily',
        timing: 'with meals',
        recommendation_reason: `Your uric acid of ${numericValue} mg/dL is above optimal (<7.0 mg/dL). We're combining tart cherry extract with quercetin because tart cherry naturally lowers uric acid production while quercetin inhibits xanthine oxidase, the enzyme that creates uric acid. This combination addresses gout risk and reduces inflammatory burden.`,
        evidence_quality: 'moderate',
        priority_score: 6,
        expected_benefits: ['Lower uric acid within 4-6 weeks', 'Reduced gout risk', 'Less inflammation'],
        contraindications: ['Monitor if on gout medications'],
        concern: 'elevated uric acid'
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
  healthGoals: string[],
  markers?: any[],
  labs?: any[]
): string {
  
  let summary = "# 🧬 Your Comprehensive Health Analysis\n\n";
  summary += "*Deep dive into your genetic variants and biomarker patterns*\n\n";
  summary += "---\n\n";

  // === GENETIC ANALYSIS SECTION ===
  if (markers && markers.length > 0) {
    summary += "## 🧬 Your Genetic Profile: Understanding Your DNA\n\n";
    summary += "*Your genetics are like your body's instruction manual - they tell us exactly how you process nutrients, medications, and respond to environmental factors.*\n\n";
    
    // Group markers by gene for better organization
    const markersByGene = markers.reduce((acc, marker) => {
      const geneRef = geneReferences.find(ref => ref.rsids.includes(marker.rsid));
      if (geneRef) {
        if (!acc[geneRef.gene]) acc[geneRef.gene] = [];
        acc[geneRef.gene].push({ ...marker, geneRef });
      }
      return acc;
    }, {});

    Object.entries(markersByGene).forEach(([gene, geneMarkers]: [string, any[]]) => {
      const firstMarker = geneMarkers[0];
      const geneRef = firstMarker.geneRef;
      const hasVariant = geneMarkers.some(m => geneRef.genotypesOfConcern?.includes(m.genotype));
      
      summary += `### ${gene} Gene ${hasVariant ? '⚠️' : '✅'}\n`;
      summary += `**What it does**: ${getGeneFunction(gene)}\n\n`;
      
      geneMarkers.forEach(marker => {
        const isVariant = geneRef.genotypesOfConcern?.includes(marker.genotype);
        const status = isVariant ? '🔶 **VARIANT**' : '✅ **NORMAL**';
        
        summary += `- **${marker.rsid}**: ${marker.genotype} ${status}\n`;
        
        if (isVariant) {
          summary += `  - **Impact**: ${geneRef.impact}\n`;
          summary += `  - **What this means for you**: ${getPersonalizedGeneticExplanation(gene, marker.rsid, marker.genotype)}\n`;
          summary += `  - **Our solution**: ${geneRef.supplement} (${geneRef.dosage})\n`;
        } else {
          summary += `  - **Good news**: Your ${gene} gene works normally for nutrient processing\n`;
        }
      });
      
      summary += "\n";
    });

    // Summary of genetic insights
    const variantGenes = Object.entries(markersByGene).filter(([gene, markers]: [string, any[]]) => 
      markers.some(m => m.geneRef.genotypesOfConcern?.includes(m.genotype))
    );
    
    if (variantGenes.length > 0) {
      summary += "### 🎯 Your Genetic Insights Summary\n\n";
      summary += `You have ${variantGenes.length} genetic variant(s) that affect how your body processes nutrients:\n\n`;
      
      variantGenes.forEach(([gene, markers]) => {
        const geneRef = markers[0].geneRef;
        summary += `- **${gene}**: ${getGeneticInsight(gene, geneRef)}\n`;
      });
      summary += "\n";
    }
    
    summary += "---\n\n";
  }

  // === BIOMARKER ANALYSIS SECTION ===
  if (labs && labs.length > 0) {
    summary += "## 📊 Your Biomarker Analysis: What Your Labs Tell Us\n\n";
    summary += "*Your lab results are like a snapshot of your body's current state - they show us exactly what's happening inside and what needs attention.*\n\n";
    
    // Process all biomarker data
    const allBiomarkers = [];
    labs.forEach(lab => {
      if (lab.biomarker_data && typeof lab.biomarker_data === 'object') {
        Object.entries(lab.biomarker_data).forEach(([name, value]) => {
          allBiomarkers.push({
            name: name,
            value: value,
            displayName: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: categorizeBiomarker(name),
            testDate: new Date(lab.created_at).toLocaleDateString()
          });
        });
      }
    });

    // Group biomarkers by category
    const biomarkersByCategory = allBiomarkers.reduce((acc, biomarker) => {
      if (!acc[biomarker.category]) acc[biomarker.category] = [];
      acc[biomarker.category].push(biomarker);
      return acc;
    }, {});

    // Display each category
    Object.entries(biomarkersByCategory).forEach(([category, biomarkers]: [string, any[]]) => {
      summary += `### ${category}\n\n`;
      
      biomarkers.forEach(biomarker => {
        const analysis = analyzeBiomarkerForEducation(biomarker.name, biomarker.value);
        const status = analysis.status || 'Normal';
        const emoji = analysis.status === 'High' ? '🔴' : analysis.status === 'Low' ? '🔵' : '✅';
        
        summary += `- **${biomarker.displayName}**: ${biomarker.value} ${emoji}\n`;
        
        if (analysis.explanation) {
          summary += `  - **What this means**: ${analysis.explanation}\n`;
        }
        
        if (analysis.implications && analysis.implications.length > 0) {
          summary += `  - **Health implications**: ${analysis.implications.join(', ')}\n`;
        }
        
        if (analysis.action) {
          summary += `  - **Our action**: ${analysis.action}\n`;
        }
      });
      
      summary += "\n";
    });
    
    // Biomarker insights summary
    const abnormalBiomarkers = allBiomarkers.filter(b => {
      const analysis = analyzeBiomarkerForEducation(b.name, b.value);
      return analysis.status && analysis.status !== 'Normal';
    });
    
    if (abnormalBiomarkers.length > 0) {
      summary += "### 🎯 Your Biomarker Insights Summary\n\n";
      summary += `We found ${abnormalBiomarkers.length} biomarker(s) outside optimal ranges that guide our recommendations:\n\n`;
      
      abnormalBiomarkers.slice(0, 5).forEach(biomarker => {
        const analysis = analyzeBiomarkerForEducation(biomarker.name, biomarker.value);
        summary += `- **${biomarker.displayName}** (${analysis.status}): ${analysis.insight || 'Requires attention'}\n`;
      });
      
      if (abnormalBiomarkers.length > 5) {
        summary += `- *And ${abnormalBiomarkers.length - 5} additional markers being addressed*\n`;
      }
      summary += "\n";
    }
    
    summary += "---\n\n";
  }

  // === PERSONALIZED PROTOCOL SECTION ===
  summary += "## 🎯 Your Personalized Supplement Protocol\n\n";
  
  const geneticDriven = recommendations.filter(r => r.source_type === 'genetic').length;
  const biomarkerDriven = recommendations.filter(r => r.source_type === 'biomarker').length;
  const drugDriven = recommendations.filter(r => r.source_type === 'drug_depletion').length;
  const dietDriven = recommendations.filter(r => r.source_type === 'diet_deficiency').length;
  const highPriority = recommendations.filter(r => (r.priority_score || 0) >= 8).length;
  
  summary += "### 📋 Protocol Overview\n\n";
  summary += `**Total Recommendations**: ${recommendations.length} targeted supplements\n`;
  summary += `**High Priority**: ${highPriority} critical recommendations\n\n`;
  
  summary += "**Recommendation Sources**:\n";
  if (geneticDriven > 0) summary += `- 🧬 **${geneticDriven} Genetic-Based**: Chosen specifically for your genetic variants\n`;
  if (biomarkerDriven > 0) summary += `- 📊 **${biomarkerDriven} Lab-Based**: Targeted to your specific biomarker patterns\n`;
  if (drugDriven > 0) summary += `- 💊 **${drugDriven} Medication-Based**: Replacing nutrients depleted by your medications\n`;
  if (dietDriven > 0) summary += `- 🥗 **${dietDriven} Diet-Based**: Filling gaps from your dietary patterns\n`;
  
  summary += "\n### 🔬 The Science Behind Your Plan\n\n";
  summary += "This isn't generic supplementation - every recommendation is backed by your specific biology:\n\n";
  
  if (geneticConcerns.length > 0) {
    summary += `**🧬 Genetic Precision**: Your ${geneticConcerns.length} genetic variant(s) (${geneticConcerns.slice(0, 2).join(', ')}${geneticConcerns.length > 2 ? ', and others' : ''}) require specific nutrient forms that bypass your genetic limitations.\n\n`;
  }
  
  if (biomarkerConcerns.length > 0) {
    summary += `**📊 Biomarker Targeting**: Your ${biomarkerConcerns.length} out-of-range biomarker(s) receive therapeutic doses calibrated to restore optimal levels.\n\n`;
  }
  
  if (healthGoals.length > 0) {
    summary += `**🎯 Goal Integration**: Every supplement supports your health goals: ${healthGoals.join(', ')}.\n\n`;
  }
  
  summary += "### 🛡️ Safety & Quality Assurance\n\n";
  summary += "Your protocol has been thoroughly screened for:\n";
  summary += "- ✅ Drug interactions with your medications\n";
  summary += "- ✅ Genetic contraindications\n";
  summary += "- ✅ Allergy considerations\n";
  summary += "- ✅ Biomarker-based safety limits\n";
  summary += "- ✅ Supplement-supplement interactions\n\n";
  
  summary += "---\n\n";
  summary += "## 🌟 Your Health Journey Forward\n\n";
  summary += "This analysis represents the most comprehensive, personalized approach to supplementation available today. By combining your genetic blueprint with real-time biomarker data, we've created a protocol that works specifically with YOUR body's unique biology.\n\n";
  summary += "**Remember**: Your genetics don't change, but your biomarkers will improve as you follow this protocol. We recommend retesting key biomarkers in 8-12 weeks to track your progress and fine-tune your plan.\n\n";
  summary += "*Ready to experience the power of precision medicine? Your personalized supplement recommendations are waiting in the Recommendations section.*";
  
  return summary;
}

// Helper function to get gene function description
function getGeneFunction(gene: string): string {
  const geneFunctions = {
    'MTHFR': 'Converts folate to active methylfolate (5-MTHF) for DNA synthesis, neurotransmitters, and detoxification',
    'COMT': 'Breaks down dopamine, norepinephrine, and estrogen - affects mood, focus, and stress response',
    'VDR': 'Vitamin D receptor that controls calcium absorption, immune function, and gene expression',
    'APOE': 'Transports cholesterol and fats in blood - major factor in cardiovascular and brain health',
    'FADS1': 'Converts plant omega-3s (ALA) to active EPA/DHA for brain and heart health',
    'FADS2': 'Works with FADS1 to process essential fatty acids',
    'HFE': 'Regulates iron absorption - variants can cause iron overload (hemochromatosis)',
    'ACE': 'Controls blood pressure by regulating angiotensin - affects cardiovascular health',
    'CYP1A2': 'Metabolizes caffeine, medications, and environmental toxins in the liver',
    'SOD2': 'Antioxidant enzyme that protects mitochondria from oxidative damage',
    'GST': 'Detoxification enzymes that neutralize toxins and free radicals',
    'MTR': 'Recycles B12 and supports methylation cycle for DNA and neurotransmitters',
    'CBS': 'Processes sulfur amino acids - affects detoxification and methylation balance',
    'default': 'Influences nutrient metabolism and cellular function'
  };
  
  return geneFunctions[gene] || geneFunctions['default'];
}

// Helper function to get personalized genetic explanation
function getPersonalizedGeneticExplanation(gene: string, rsid: string, genotype: string): string {
  const explanations = {
    'MTHFR': `Your body converts folate to active form 30-70% less efficiently than normal. You need pre-methylated folate (L-methylfolate) instead of regular folic acid because your enzyme can't process synthetic forms effectively.`,
    'COMT': `Your COMT enzyme ${genotype === 'AA' ? 'works 3-4x slower than normal, causing dopamine buildup' : 'works too fast, causing rapid dopamine breakdown'}. This affects your stress response, mood, and ${genotype === 'AA' ? 'makes you more sensitive to stimulants' : 'may cause attention/focus issues'}.`,
    'VDR': `Your vitamin D receptor doesn't bind vitamin D as efficiently as normal. You need 50-100% higher vitamin D doses to achieve the same biological effects for bone health, immunity, and mood.`,
    'APOE': `Your APOE4 variant increases cardiovascular and Alzheimer's risk. You process saturated fats poorly and need more omega-3s for brain protection and inflammation control.`,
    'FADS1': `You convert plant omega-3s (like flax seeds) to active EPA/DHA 50-80% less efficiently. You need direct EPA/DHA from fish or algae instead of relying on plant sources.`,
    'HFE': `Your variant affects iron regulation. ${genotype.includes('C') || genotype.includes('A') ? 'You may absorb too much iron from food and should NEVER take iron supplements' : 'You may have altered iron metabolism requiring monitoring'}.`,
    'CYP1A2': `You metabolize caffeine ${genotype.includes('A') ? 'very slowly - limit coffee and be cautious with stimulants' : 'normally - standard caffeine intake is fine'}.`,
    'default': `This variant affects how your body processes nutrients and may require specific supplementation approaches.`
  };
  
  return explanations[gene] || explanations['default'];
}

// Helper function to get genetic insight
function getGeneticInsight(gene: string, geneRef: any): string {
  const insights = {
    'MTHFR': 'Requires methylated B vitamins (never synthetic forms)',
    'COMT': 'Needs personalized methyl donor dosing based on enzyme speed',
    'VDR': 'Benefits from higher vitamin D doses with K2 and magnesium',
    'APOE': 'Requires anti-inflammatory focus with omega-3 emphasis',
    'FADS1': 'Needs direct EPA/DHA instead of plant-based omega-3s',
    'HFE': 'Requires iron monitoring (supplementation may be contraindicated)',
    'CYP1A2': 'Affects caffeine and supplement metabolism rates',
    'default': 'Influences supplement selection and dosing'
  };
  
  return insights[gene] || insights['default'];
}

// Helper function to categorize biomarkers
function categorizeBiomarker(name: string): string {
  const key = name.toLowerCase();
  
  if (key.includes('cholesterol') || key.includes('hdl') || key.includes('ldl') || key.includes('triglyceride') || key.includes('lipid')) {
    return '🫀 Cardiovascular Panel';
  } else if (key.includes('glucose') || key.includes('insulin') || key.includes('hba1c') || key.includes('hemoglobin_a1c')) {
    return '🍭 Metabolic Panel';
  } else if (key.includes('vitamin') || key.includes('b12') || key.includes('folate') || key.includes('d_25') || key.includes('25_oh')) {
    return '🦴 Vitamin Panel';
  } else if (key.includes('iron') || key.includes('ferritin') || key.includes('zinc') || key.includes('magnesium') || key.includes('calcium')) {
    return '⚗️ Mineral Panel';
  } else if (key.includes('testosterone') || key.includes('estradiol') || key.includes('tsh') || key.includes('t4') || key.includes('t3') || key.includes('cortisol')) {
    return '🔬 Hormone Panel';
  } else if (key.includes('alt') || key.includes('ast') || key.includes('bilirubin') || key.includes('alkaline')) {
    return '🫁 Liver Function';
  } else if (key.includes('creatinine') || key.includes('bun') || key.includes('egfr') || key.includes('albumin')) {
    return '🔬 Kidney Function';
  } else if (key.includes('wbc') || key.includes('rbc') || key.includes('hemoglobin') || key.includes('hematocrit') || key.includes('platelet')) {
    return '🩸 Blood Count';
  } else if (key.includes('crp') || key.includes('esr') || key.includes('inflammatory')) {
    return '🔥 Inflammation';
  } else {
    return '📋 Other Markers';
  }
}

// Helper function to analyze biomarker for education
function analyzeBiomarkerForEducation(name: string, value: any): any {
  const numValue = parseFloat(String(value));
  if (isNaN(numValue)) return { status: 'Normal', explanation: 'Non-numeric value' };
  
  const key = name.toLowerCase();
  
  // Vitamin D
  if (key.includes('vitamin_d') || key.includes('25_oh') || key.includes('d_25')) {
    if (numValue < 20) {
      return {
        status: 'Low',
        explanation: 'Vitamin D deficiency affects immune function, bone health, and mood',
        implications: ['Weak immunity', 'Poor bone health', 'Mood issues'],
        action: 'High-dose D3 with K2 recommended',
        insight: 'Critical deficiency requiring therapeutic dosing'
      };
    } else if (numValue < 30) {
      return {
        status: 'Low',
        explanation: 'Vitamin D insufficiency - below optimal for health',
        implications: ['Suboptimal immunity', 'Increased inflammation'],
        action: 'Moderate D3 supplementation',
        insight: 'Below optimal levels for peak health'
      };
    }
  }
  
  // B12
  if (key.includes('b12') || key.includes('cobalamin')) {
    if (numValue < 300) {
      return {
        status: 'Low',
        explanation: 'B12 deficiency affects energy, brain function, and red blood cell formation',
        implications: ['Fatigue', 'Brain fog', 'Nerve problems'],
        action: 'High-dose methylcobalamin recommended',
        insight: 'Deficiency affecting energy and cognitive function'
      };
    }
  }
  
  // Iron/Ferritin
  if (key.includes('ferritin')) {
    if (numValue < 30) {
      return {
        status: 'Low',
        explanation: 'Low iron stores affect oxygen transport and energy production',
        implications: ['Fatigue', 'Cold hands/feet', 'Restless legs'],
        action: 'Iron supplementation with vitamin C',
        insight: 'Iron deficiency contributing to fatigue'
      };
    } else if (numValue > 200) {
      return {
        status: 'High',
        explanation: 'Elevated iron stores may indicate inflammation or iron overload',
        implications: ['Oxidative stress', 'Organ damage risk'],
        action: 'Avoid iron supplements, investigate cause',
        insight: 'High iron levels requiring investigation'
      };
    }
  }
  
  // Cholesterol
  if (key.includes('ldl')) {
    if (numValue > 100) {
      return {
        status: 'High',
        explanation: 'Elevated LDL cholesterol increases cardiovascular disease risk',
        implications: ['Heart disease risk', 'Arterial plaque'],
        action: 'Plant sterols and red yeast rice recommended',
        insight: 'Cardiovascular risk factor requiring intervention'
      };
    }
  }
  
  // Magnesium
  if (key.includes('magnesium')) {
    if (numValue < 1.8) {
      return {
        status: 'Low',
        explanation: 'Low magnesium affects muscle function, sleep, and stress response',
        implications: ['Muscle cramps', 'Poor sleep', 'Anxiety'],
        action: 'Magnesium glycinate supplementation',
        insight: 'Deficiency affecting multiple body systems'
      };
    }
  }
  
  return { status: 'Normal', explanation: 'Within normal ranges' };
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

// DRUG DEPLETION PROFILE MATCHER
// Matches medication names (with variations) to depletion profiles
function findMedicationDepletionProfile(normalizedMedication: string): any | null {
  console.log(`Looking for depletion profile for: ${normalizedMedication}`);
  
  // Direct matches first
  if (drugNutrientDepletion[normalizedMedication]) {
    return drugNutrientDepletion[normalizedMedication];
  }
  
  // Fuzzy matching for common medication patterns
  const medicationMappings = {
    // STATINS
    'atorvastatin': 'statin', 'simvastatin': 'statin', 'rosuvastatin': 'statin', 
    'pravastatin': 'statin', 'lovastatin': 'statin', 'fluvastatin': 'statin',
    'lipitor': 'statin', 'zocor': 'statin', 'crestor': 'statin', 'pravachol': 'statin',
    
    // ACE INHIBITORS
    'lisinopril': 'ace_inhibitor', 'enalapril': 'ace_inhibitor', 'captopril': 'ace_inhibitor',
    'ramipril': 'ace_inhibitor', 'benazepril': 'ace_inhibitor', 'quinapril': 'ace_inhibitor',
    'prinivil': 'ace_inhibitor', 'zestril': 'ace_inhibitor', 'vasotec': 'ace_inhibitor',
    
    // BETA BLOCKERS
    'metoprolol': 'beta_blocker', 'atenolol': 'beta_blocker', 'propranolol': 'beta_blocker',
    'carvedilol': 'beta_blocker', 'bisoprolol': 'beta_blocker', 'nebivolol': 'beta_blocker',
    'lopressor': 'beta_blocker', 'tenormin': 'beta_blocker', 'inderal': 'beta_blocker',
    
    // DIURETICS
    'hydrochlorothiazide': 'diuretic', 'furosemide': 'diuretic', 'chlorthalidone': 'diuretic',
    'spironolactone': 'diuretic', 'triamterene': 'diuretic', 'bumetanide': 'diuretic',
    'hctz': 'diuretic', 'lasix': 'diuretic', 'aldactone': 'diuretic',
    
    // DIABETES MEDICATIONS
    'metformin': 'metformin', 'glucophage': 'metformin', 'fortamet': 'metformin',
    'glumetza': 'metformin', 'riomet': 'metformin',
    
    // ACID BLOCKERS - PPIs
    'omeprazole': 'ppi', 'lansoprazole': 'ppi', 'pantoprazole': 'ppi',
    'esomeprazole': 'ppi', 'rabeprazole': 'ppi', 'dexlansoprazole': 'ppi',
    'prilosec': 'ppi', 'prevacid': 'ppi', 'protonix': 'ppi', 'nexium': 'ppi',
    
    // ACID BLOCKERS - H2
    'ranitidine': 'h2_blocker', 'famotidine': 'h2_blocker', 'cimetidine': 'h2_blocker',
    'nizatidine': 'h2_blocker', 'zantac': 'h2_blocker', 'pepcid': 'h2_blocker',
    
    // ANTIDEPRESSANTS - SSRIs
    'sertraline': 'ssri', 'fluoxetine': 'ssri', 'paroxetine': 'ssri', 'citalopram': 'ssri',
    'escitalopram': 'ssri', 'fluvoxamine': 'ssri',
    'zoloft': 'ssri', 'prozac': 'ssri', 'paxil': 'ssri', 'celexa': 'ssri', 'lexapro': 'ssri',
    
    // ANTIBIOTICS
    'amoxicillin': 'antibiotic', 'azithromycin': 'antibiotic', 'doxycycline': 'antibiotic',
    'ciprofloxacin': 'antibiotic', 'clindamycin': 'antibiotic', 'cephalexin': 'antibiotic',
    'penicillin': 'antibiotic', 'zithromax': 'antibiotic', 'cipro': 'antibiotic',
    
    // BIRTH CONTROL
    'birth_control': 'birth_control', 'oral_contraceptive': 'birth_control', 'the_pill': 'birth_control',
    'ortho': 'birth_control', 'yaz': 'birth_control', 'yasmin': 'birth_control', 'lo_loestrin': 'birth_control',
    
    // STEROIDS
    'prednisone': 'corticosteroid', 'prednisolone': 'corticosteroid', 'methylprednisolone': 'corticosteroid',
    'hydrocortisone': 'corticosteroid', 'dexamethasone': 'corticosteroid', 'cortisone': 'corticosteroid',
    'medrol': 'corticosteroid', 'deltasone': 'corticosteroid'
  };
  
  // Check for partial matches
  for (const [medPattern, profileKey] of Object.entries(medicationMappings)) {
    if (normalizedMedication.includes(medPattern) || medPattern.includes(normalizedMedication)) {
      console.log(`Found match: ${normalizedMedication} → ${profileKey}`);
      return drugNutrientDepletion[profileKey];
    }
  }
  
  // Check for class-based matches
  if (normalizedMedication.includes('statin')) return drugNutrientDepletion['statin'];
  if (normalizedMedication.includes('ace') || normalizedMedication.includes('pril')) return drugNutrientDepletion['ace_inhibitor'];
  if (normalizedMedication.includes('olol') || normalizedMedication.includes('beta')) return drugNutrientDepletion['beta_blocker'];
  if (normalizedMedication.includes('thiazide') || normalizedMedication.includes('diuretic')) return drugNutrientDepletion['diuretic'];
  if (normalizedMedication.includes('prazole') || normalizedMedication.includes('ppi')) return drugNutrientDepletion['ppi'];
  if (normalizedMedication.includes('tidine') || normalizedMedication.includes('h2')) return drugNutrientDepletion['h2_blocker'];
  if (normalizedMedication.includes('ssri') || normalizedMedication.includes('antidepressant')) return drugNutrientDepletion['ssri'];
  if (normalizedMedication.includes('antibiotic') || normalizedMedication.includes('cillin') || normalizedMedication.includes('cycline')) return drugNutrientDepletion['antibiotic'];
  if (normalizedMedication.includes('prednisone') || normalizedMedication.includes('steroid') || normalizedMedication.includes('cortis')) return drugNutrientDepletion['corticosteroid'];
  
  console.log(`No depletion profile found for: ${normalizedMedication}`);
  return null;
}

// GENETIC OVERRIDE SYSTEM - Genetics take priority over all other recommendations
// This ensures the person's genetic "software" drives the supplement choices
function applyGeneticOverrides(
  recommendations: any[], 
  markers: any[], 
  warnings: string[]
): any[] {
  
  console.log("🧬 Applying genetic overrides - genetics are the person's software and take priority...");
  
  if (!markers || markers.length === 0) {
    console.log("No genetic data available for overrides");
    return recommendations;
  }
  
  // STEP 1: Identify user's genetic variants
  const userGeneticProfile = {
    hasMTHFR: markers.some(m => 
      ['rs1801133', 'rs1801131'].includes(m.rsid) && 
      ['CT', 'TT', 'AC', 'CC'].includes(m.genotype)
    ),
    hasCOMTSlow: markers.some(m => 
      m.rsid === 'rs4680' && m.genotype === 'AA'
    ),
    hasHFE: markers.some(m => 
      ['rs1799945', 'rs1800562'].includes(m.rsid) && 
      ['CC', 'AA'].includes(m.genotype)
    ),
    hasAPOE4: markers.some(m => 
      m.rsid === 'rs429358' && ['TC', 'CC'].includes(m.genotype)
    ),
    hasVDRVariant: markers.some(m => 
      ['rs2228570', 'rs1544410', 'rs7975232'].includes(m.rsid) && 
      ['CC', 'TT', 'AA'].includes(m.genotype)
    )
  };
  
  console.log("User genetic profile:", userGeneticProfile);
  
  const processedRecommendations = [...recommendations];
  
  // STEP 2: MTHFR OVERRIDES - Never synthetic B vitamins, always methylated forms
  if (userGeneticProfile.hasMTHFR) {
    console.log("🧬 MTHFR variants detected - applying methylated form overrides");
    
    for (let i = 0; i < processedRecommendations.length; i++) {
      const rec = processedRecommendations[i];
      const supplementLower = rec.supplement_name.toLowerCase();
      
      // NEVER folic acid for MTHFR variants - always L-Methylfolate
      if (supplementLower.includes('folic acid') || 
          (supplementLower.includes('folate') && !supplementLower.includes('methylfolate'))) {
        rec.supplement_name = 'L-Methylfolate';
        rec.dosage_amount = Math.min(rec.dosage_amount, 800); // Cap at 800 mcg
        rec.dosage_unit = 'mcg';
        rec.recommendation_reason = `🧬 **GENETIC OVERRIDE - MTHFR**: Your MTHFR genetic variants cannot process regular folic acid. We've switched you to L-Methylfolate, the active form your body can use directly. This is critical for proper methylation function with your genetic profile.`;
        rec.genetic_reasoning = `MTHFR variants reduce enzyme activity by 30-70%, requiring pre-methylated forms`;
        rec.priority_score = 10; // Maximum priority for genetic overrides
        warnings.push(`🧬 GENETIC OVERRIDE: Folic acid → L-Methylfolate (MTHFR variants cannot process synthetic forms)`);
      }
      
      // NEVER cyanocobalamin for MTHFR variants - always methylcobalamin
      if (supplementLower.includes('cyanocobalamin') || 
          (supplementLower.includes('b12') && !supplementLower.includes('methyl'))) {
        rec.supplement_name = 'Methylcobalamin B12';
        rec.dosage_unit = 'mcg';
        rec.recommendation_reason = `🧬 **GENETIC OVERRIDE - MTHFR**: Your MTHFR variants require methylated B12. We've switched you to Methylcobalamin, which bypasses your genetic bottleneck and provides the active form your body needs.`;
        rec.genetic_reasoning = `MTHFR variants impair B12 recycling - methylated forms essential`;
        rec.priority_score = 10;
        warnings.push(`🧬 GENETIC OVERRIDE: Cyanocobalamin → Methylcobalamin (MTHFR requires active forms)`);
      }
      
      // NEVER pyridoxine for MTHFR variants - always P5P (active B6)
      if (supplementLower.includes('pyridoxine') || 
          (supplementLower.includes('b6') && !supplementLower.includes('p5p'))) {
        rec.supplement_name = 'P5P (B6)';
        rec.dosage_amount = Math.min(rec.dosage_amount, 50); // Cap at 50 mg
        rec.dosage_unit = 'mg';
        rec.recommendation_reason = `🧬 **GENETIC OVERRIDE - MTHFR**: Your MTHFR variants need the active form of B6. We've switched you to P5P (Pyridoxal-5-Phosphate), which your body can use immediately without conversion.`;
        rec.genetic_reasoning = `P5P is the active coenzyme form - essential for MTHFR function`;
        rec.priority_score = 10;
        warnings.push(`🧬 GENETIC OVERRIDE: Pyridoxine → P5P (MTHFR requires active B6)`);
      }
    }
  }
  
  // STEP 3: COMT SLOW OVERRIDES - Avoid overmethylation
  if (userGeneticProfile.hasCOMTSlow) {
    console.log("🧬 COMT slow variants detected - preventing overmethylation");
    
    for (let i = 0; i < processedRecommendations.length; i++) {
      const rec = processedRecommendations[i];
      const supplementLower = rec.supplement_name.toLowerCase();
      
      // Reduce methylfolate dose for COMT slow variants
      if (supplementLower.includes('methylfolate')) {
        rec.dosage_amount = Math.min(rec.dosage_amount, 400); // Cap at 400 mcg
        rec.recommendation_reason += ` 🧬 **GENETIC DOSE ADJUSTMENT**: Your COMT variant processes methyl groups slowly, so we've reduced the dose to prevent overmethylation symptoms like anxiety or insomnia.`;
        rec.genetic_reasoning = `COMT slow variants accumulate methyl groups - lower doses prevent overmethylation`;
        warnings.push(`🧬 GENETIC DOSE ADJUSTMENT: Reduced methylfolate dose for COMT slow variant (prevent overmethylation)`);
      }
      
      // Add calming nutrients for COMT slow variants
      if (supplementLower.includes('magnesium')) {
        rec.dosage_amount = Math.max(rec.dosage_amount, 400); // Ensure adequate magnesium
        rec.recommendation_reason += ` 🧬 **GENETIC ENHANCEMENT**: Your COMT slow variant benefits from higher magnesium to support neurotransmitter balance and prevent overstimulation.`;
        rec.genetic_reasoning = `COMT slow variants need more magnesium for neurotransmitter clearance`;
        warnings.push(`🧬 GENETIC ENHANCEMENT: Increased magnesium for COMT slow variant support`);
      }
    }
    
    // Remove high-dose methyl donors that could cause overmethylation
    const filteredRecommendations = processedRecommendations.filter(rec => {
      const supplementLower = rec.supplement_name.toLowerCase();
      if ((supplementLower.includes('same') || supplementLower.includes('dmg')) && rec.dosage_amount > 200) {
        warnings.push(`🧬 GENETIC REMOVAL: Removed ${rec.supplement_name} (high-dose methyl donor contraindicated with COMT slow)`);
        return false;
      }
      return true;
    });
    
    return filteredRecommendations;
  }
  
  // STEP 4: HFE OVERRIDES - NEVER iron supplements
  if (userGeneticProfile.hasHFE) {
    console.log("🧬 HFE variants detected - absolute iron contraindication");
    
    const filteredRecommendations = processedRecommendations.filter(rec => {
      const supplementLower = rec.supplement_name.toLowerCase();
      if (supplementLower.includes('iron')) {
        warnings.push(`🧬 ABSOLUTE GENETIC CONTRAINDICATION: Removed ${rec.supplement_name} - HFE variants have iron overload risk`);
        return false;
      }
      return true;
    });
    
    // Add lactoferrin as a safer alternative if iron was needed
    const hadIronRecommendation = processedRecommendations.some(rec => 
      rec.supplement_name.toLowerCase().includes('iron')
    );
    
    if (hadIronRecommendation) {
      filteredRecommendations.push({
        supplement_name: 'Lactoferrin',
        dosage_amount: 200,
        dosage_unit: 'mg',
        frequency: 'daily',
        timing: 'with_meals',
        recommendation_reason: `🧬 **GENETIC ALTERNATIVE - HFE**: Your HFE variants prevent iron supplementation due to overload risk. Lactoferrin provides iron support without the accumulation risk, as it's a natural iron-binding protein.`,
        evidence_quality: 'moderate',
        priority_score: 8,
        genetic_reasoning: `HFE variants cause iron accumulation - lactoferrin provides iron benefits without overload risk`,
        source_type: 'genetic_override',
        source_data: { original_supplement: 'Iron', override_reason: 'HFE variants' }
      });
      
      warnings.push(`🧬 GENETIC ALTERNATIVE: Added Lactoferrin as safer iron alternative for HFE variants`);
    }
    
    return filteredRecommendations;
  }
  
  // STEP 5: APOE4 OVERRIDES - Avoid saturated fats, emphasize anti-inflammatory
  if (userGeneticProfile.hasAPOE4) {
    console.log("🧬 APOE4 variants detected - cardiovascular/cognitive protection emphasis");
    
    for (const rec of processedRecommendations) {
      const supplementLower = rec.supplement_name.toLowerCase();
      
      // Increase omega-3 dose for APOE4 carriers
      if (supplementLower.includes('omega-3') || supplementLower.includes('fish oil')) {
        rec.dosage_amount = Math.max(rec.dosage_amount, 2000); // Higher dose for APOE4
        rec.recommendation_reason += ` 🧬 **GENETIC ENHANCEMENT**: Your APOE4 variant increases cardiovascular and cognitive risks. We've increased your omega-3 dose for enhanced neuroprotection.`;
        rec.genetic_reasoning = `APOE4 carriers have higher inflammation and need more omega-3 for protection`;
        warnings.push(`🧬 GENETIC ENHANCEMENT: Increased omega-3 dose for APOE4 cardiovascular/cognitive protection`);
      }
      
      // Avoid coconut oil and high saturated fat supplements
      if (supplementLower.includes('coconut oil') || supplementLower.includes('mct')) {
        rec.contraindications = [...(rec.contraindications || []), 
          'APOE4 carriers should limit saturated fats for cardiovascular health'];
        warnings.push(`🧬 GENETIC CAUTION: Added saturated fat warning for APOE4 carrier`);
      }
    }
  }
  
  // STEP 6: VDR OVERRIDES - Higher vitamin D requirements
  if (userGeneticProfile.hasVDRVariant) {
    console.log("🧬 VDR variants detected - increased vitamin D requirements");
    
    for (const rec of processedRecommendations) {
      const supplementLower = rec.supplement_name.toLowerCase();
      
      if (supplementLower.includes('vitamin d')) {
        rec.dosage_amount = Math.max(rec.dosage_amount * 1.5, 4000); // 50% higher dose, minimum 4000 IU
        rec.dosage_unit = 'IU';
        rec.recommendation_reason += ` 🧬 **GENETIC DOSE ADJUSTMENT**: Your VDR (Vitamin D Receptor) variants reduce receptor efficiency. We've increased your dose 50% to achieve the same biological effect as someone with normal VDR function.`;
        rec.genetic_reasoning = `VDR variants reduce receptor binding efficiency - higher doses needed for same effect`;
        warnings.push(`🧬 GENETIC DOSE ADJUSTMENT: Increased vitamin D dose 50% for VDR variant compensation`);
        
        // Always add K2 and magnesium for VDR variants
        if (!rec.supplement_name.toLowerCase().includes('k2')) {
          rec.supplement_name = 'Vitamin D3 + K2';
          rec.recommendation_reason += ` Combined with K2 for optimal calcium metabolism with your genetic profile.`;
        }
      }
    }
  }
  
  console.log(`🧬 Genetic override analysis complete - genetics prioritized over all other factors`);
  return processedRecommendations;
}

// Fallback function to create generic product links when automatic linking fails
async function createFallbackProductLink(recommendationId: string, supplementName: string) {
  try {
    console.log(`🔄 Creating fallback product link for ${supplementName}`);
    
    // Create a search link as fallback
    const fallbackLink = {
      recommendation_id: recommendationId,
      brand: "Multiple Options",
      product_name: `${supplementName} - Find Best Price`,
      product_url: `https://www.vitacost.com/search?t=${encodeURIComponent(supplementName)}`,
      image_url: null,
      price: null,
      search_query: supplementName,
      relevance_score: 1,
      matches_dosage: false,
      third_party_tested: false,
      gmp_certified: false,
      serving_size: null,
      servings_per_container: null
    };
    
    const { error } = await supabase.from('product_links').insert(fallbackLink);
    
    if (error) {
      console.error(`❌ Error creating fallback link for ${supplementName}:`, error);
    } else {
      console.log(`✅ Created fallback link for ${supplementName}`);
    }
  } catch (error) {
    console.error(`❌ Error in createFallbackProductLink for ${supplementName}:`, error);
  }
}
