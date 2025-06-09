"use client";
import Image from 'next/image';
import { Pill, Dna, Activity, Clock, AlertTriangle } from 'lucide-react';
import { useIntake } from '../../utils/useIntake';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface RecWithProduct {
  id: string;
  supplement_name: string;
  dosage_amount: number;
  dosage_unit: string;
  frequency: string;
  recommendation_reason: string;
  evidence_quality: string;
  contraindications: string[] | null;
  priority_score?: number;
  expected_benefits?: string[] | null;
  timing?: string;
  interaction_warnings?: string[] | null;
  monitoring_needed?: string[] | null;
  genetic_reasoning?: string;
  biomarker_reasoning?: string;
  product_links?: {
    id?: string;
    product_url: string | null;
    product_name?: string | null;
    brand?: string | null;
    image_url: string | null;
    price: number | null;
    verified?: boolean;
  }[];
}

export default function RecommendationCard({ rec, onDetails }: { rec: RecWithProduct; onDetails: () => void }) {
  const product = rec.product_links?.[0];
  const { count, mutate } = useIntake(rec.id);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClientComponentClient();

  const handleBuyClick = async () => {
    setIsSearching(true);
    try {
      // First, try to use existing product links if available
      if (product?.product_url && product.verified !== false) {
        console.log(`Using existing product link: ${product.brand} - ${product.product_url}`);
        window.open(product.product_url, '_blank');
        return;
      }

      // If no product links exist, call the product_search function
      console.log(`No existing links found, searching for: ${rec.supplement_name}`);
      const { data, error } = await supabase.functions.invoke('product_search', {
        body: { supplement_name: rec.supplement_name }
      });
      
      if (!error && data?.success && data?.product_url) {
        console.log(`Found via search: ${data.brand} - ${data.product_url}`);
        window.open(data.product_url, '_blank');
      } else {
        console.log('Search failed, using generic fallback');
        // Fallback to generic search
        window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank');
      }
    } catch (error) {
      console.error('Product search error:', error);
      // Fallback to generic search
      window.open(`https://www.vitacost.com/search?t=${encodeURIComponent(rec.supplement_name)}`, '_blank');
    } finally {
      setIsSearching(false);
    }
  };

  // Get button text and subtitle based on what's available
  const getButtonInfo = () => {
    if (isSearching) return { text: 'Finding Best Price...', subtitle: null };
    
    if (product?.product_url && product.verified !== false) {
      const brandText = product.brand || 'Shop Now';
      const priceText = product.price ? ` - $${product.price}` : '';
      return { 
        text: `Buy from ${brandText}`, 
        subtitle: product.price ? `$${product.price}` : null 
      };
    }
    
    return { text: 'Find Best Price', subtitle: 'Multiple retailers' };
  };

  const buttonInfo = getButtonInfo();

  // Extract specific genetic variants and biomarkers from reasoning
  const extractPersonalizationDetails = () => {
    const geneticVariants = [];
    const biomarkerFindings = [];

    // Extract genetic variants from genetic_reasoning or recommendation_reason
    const geneticText = rec.genetic_reasoning || rec.recommendation_reason || '';
    
    // Comprehensive list of supplementation-relevant genetic variants
    const geneticPatterns = [
      // === METHYLATION & FOLATE PATHWAY ===
      // MTHFR variants (folate metabolism)
      { regex: /MTHFR\s+(C677T|A1298C):\s*([A-Z]{1,2})/gi, name: 'MTHFR' },
      // MTRR (B12 metabolism)
      { regex: /MTRR\s+([A-Z]{1,2}|rs1801394)/gi, name: 'MTRR' },
      // MTR (B12/folate metabolism)
      { regex: /MTR\s+([A-Z]{1,2}|rs1805087)/gi, name: 'MTR' },
      // AHCY (homocysteine metabolism)
      { regex: /AHCY\s+([A-Z]{1,2}|rs819147)/gi, name: 'AHCY' },
      // MTHFD1 (folate metabolism)
      { regex: /MTHFD1\s+([A-Z]{1,2}|rs2236225)/gi, name: 'MTHFD1' },
      // SHMT1 (serine metabolism)
      { regex: /SHMT1\s+([A-Z]{1,2}|rs1979277)/gi, name: 'SHMT1' },
      // BHMT (betaine metabolism)
      { regex: /BHMT\s+([A-Z]{1,2}|rs3733890)/gi, name: 'BHMT' },
      // DHFR (dihydrofolate reductase)
      { regex: /DHFR\s+([A-Z]{1,2}|rs70991108)/gi, name: 'DHFR' },
      // TYMS (thymidylate synthase)
      { regex: /TYMS\s+([A-Z]{1,2}|rs34743033)/gi, name: 'TYMS' },
      
      // === NEUROTRANSMITTER & MOOD ===
      // COMT variants (dopamine, requires magnesium/B-vitamins)
      { regex: /COMT\s+([A-Z]{1,2}|Val158Met|rs4680)/gi, name: 'COMT' },
      // MAO-A (serotonin metabolism, 5-HTP needs)
      { regex: /MAOA?\s+([A-Z]{1,2}|rs6323)/gi, name: 'MAO-A' },
      // BDNF (brain health, magnesium needs)
      { regex: /BDNF\s+([A-Z]{1,2}|rs6265|Val66Met)/gi, name: 'BDNF' },
      // HTR2A (serotonin receptor)
      { regex: /HTR2A\s+([A-Z]{1,2}|rs6313)/gi, name: 'HTR2A' },
      // HTR1A/HTR1B (serotonin receptors)
      { regex: /HTR1[AB]\s+([A-Z]{1,2}|rs6295|rs6296)/gi, name: 'HTR1' },
      // SLC6A4 (serotonin transporter)
      { regex: /SLC6A4\s+([A-Z]{1,2}|rs25531)/gi, name: 'SLC6A4' },
      // SLC6A2 (norepinephrine transporter)
      { regex: /SLC6A2\s+([A-Z]{1,2}|rs5569)/gi, name: 'SLC6A2' },
      // SLC6A3 (dopamine transporter)
      { regex: /SLC6A3\s+([A-Z]{1,2}|rs28363170)/gi, name: 'SLC6A3' },
      // DRD2/DRD4 (dopamine receptors)
      { regex: /DRD[24]\s+([A-Z]{1,2}|rs1800497|rs1800955)/gi, name: 'DRD' },
      // TPOH1/TPOH2 (tryptophan hydroxylase)
      { regex: /TPH[12]\s+([A-Z]{1,2}|rs1800532|rs4570625)/gi, name: 'TPH' },
      // TH (tyrosine hydroxylase)
      { regex: /TH\s+([A-Z]{1,2}|rs6356)/gi, name: 'TH' },
      // DDC (DOPA decarboxylase)
      { regex: /DDC\s+([A-Z]{1,2}|rs921451)/gi, name: 'DDC' },
      // DBH (dopamine beta-hydroxylase)
      { regex: /DBH\s+([A-Z]{1,2}|rs1611115)/gi, name: 'DBH' },
      
      // === DETOXIFICATION & ANTIOXIDANTS ===
      // GSTM1/GSTT1/GSTP1 (detox, NAC needs)
      { regex: /GST[MTP]1\s+([A-Z]{1,2}|null|present|rs1695)/gi, name: 'GST' },
      // SOD2 (antioxidant needs, manganese)
      { regex: /SOD2\s+([A-Z]{1,2}|rs4880|Val16Ala)/gi, name: 'SOD2' },
      // GPX1 (selenium needs)
      { regex: /GPX1\s+([A-Z]{1,2}|rs1050450)/gi, name: 'GPX1' },
      // NQO1 (antioxidant pathways)
      { regex: /NQO1\s+([A-Z]{1,2}|rs1800566)/gi, name: 'NQO1' },
      // CAT (catalase)
      { regex: /CAT\s+([A-Z]{1,2}|rs1001179)/gi, name: 'CAT' },
      // HMOX1 (heme oxygenase)
      { regex: /HMOX1\s+([A-Z]{1,2}|rs2071746)/gi, name: 'HMOX1' },
      // PON1 (paraoxonase)
      { regex: /PON1\s+([A-Z]{1,2}|rs662)/gi, name: 'PON1' },
      // GCLC/GCLM (glutathione synthesis)
      { regex: /GCL[CM]\s+([A-Z]{1,2}|rs17883901)/gi, name: 'GCL' },
      
      // === VITAMIN METABOLISM & TRANSPORT ===
      // VDR variants (vitamin D receptor)
      { regex: /VDR\s+([A-Z]{1,2}|rs2228570|rs1544410|rs7975232)/gi, name: 'VDR' },
      // CYP24A1 (vitamin D metabolism)
      { regex: /CYP24A1\s+([A-Z]{1,2}|rs6013897)/gi, name: 'CYP24A1' },
      // CYP27B1 (vitamin D activation)
      { regex: /CYP27B1\s+([A-Z]{1,2}|rs10877012)/gi, name: 'CYP27B1' },
      // CYP2R1 (vitamin D hydroxylase)
      { regex: /CYP2R1\s+([A-Z]{1,2}|rs10741657)/gi, name: 'CYP2R1' },
      // GC (vitamin D binding protein)
      { regex: /GC\s+([A-Z]{1,2}|rs2282679)/gi, name: 'GC' },
      // DHCR7 (vitamin D synthesis)
      { regex: /DHCR7\s+([A-Z]{1,2}|rs12785878)/gi, name: 'DHCR7' },
      // FUT2 (B12 absorption, gut health)
      { regex: /FUT2\s+([A-Z]{1,2}|rs601338)/gi, name: 'FUT2' },
      // TCN2 (B12 transport)
      { regex: /TCN2\s+([A-Z]{1,2}|rs1801198)/gi, name: 'TCN2' },
      // CUBN (B12 absorption)
      { regex: /CUBN\s+([A-Z]{1,2}|rs1801222)/gi, name: 'CUBN' },
      // AMN (B12 absorption)
      { regex: /AMN\s+([A-Z]{1,2}|rs2287921)/gi, name: 'AMN' },
      // GIF (gastric intrinsic factor)
      { regex: /GIF\s+([A-Z]{1,2}|rs602662)/gi, name: 'GIF' },
      // RFC1 (folate transport)
      { regex: /RFC1\s+([A-Z]{1,2}|rs1051266)/gi, name: 'RFC1' },
      // FOLR1/FOLR2 (folate receptors)
      { regex: /FOLR[12]\s+([A-Z]{1,2}|rs2071010)/gi, name: 'FOLR' },
      // SLC23A1/SLC23A2 (vitamin C transport)
      { regex: /SLC23A[12]\s+([A-Z]{1,2}|rs33972313)/gi, name: 'SLC23A' },
      // SCARB1 (vitamin E transport)
      { regex: /SCARB1\s+([A-Z]{1,2}|rs5888)/gi, name: 'SCARB1' },
      // BCMO1 (beta-carotene to vitamin A conversion)
      { regex: /BCMO1\s+([A-Z]{1,2}|rs7501331|rs12934922)/gi, name: 'BCMO1' },
      // SLC19A1 (thiamine transport)
      { regex: /SLC19A1\s+([A-Z]{1,2}|rs1051266)/gi, name: 'SLC19A1' },
      // SLC52A1/SLC52A2/SLC52A3 (riboflavin transport)
      { regex: /SLC52A[123]\s+([A-Z]{1,2}|rs2073616)/gi, name: 'SLC52A' },
      // SLC5A6 (biotin transport)
      { regex: /SLC5A6\s+([A-Z]{1,2}|rs2239907)/gi, name: 'SLC5A6' },
      // NBPF3 (vitamin B6 metabolism)
      { regex: /NBPF3\s+([A-Z]{1,2}|rs4654748)/gi, name: 'NBPF3' },
      
      // === IRON METABOLISM ===
      // HFE (iron metabolism/hemochromatosis)
      { regex: /HFE\s+([A-Z]{1,2}|C282Y|H63D|rs1799945)/gi, name: 'HFE' },
      // TMPRSS6 (iron regulation)
      { regex: /TMPRSS6\s+([A-Z]{1,2}|rs855791)/gi, name: 'TMPRSS6' },
      // TF (transferrin)
      { regex: /TF\s+([A-Z]{1,2}|rs3811647)/gi, name: 'TF' },
      // TFRC (transferrin receptor)
      { regex: /TFRC\s+([A-Z]{1,2}|rs3817672)/gi, name: 'TFRC' },
      
      // === CARDIOVASCULAR & LIPIDS ===
      // APOE variants (cardiovascular risk, omega-3 needs)
      { regex: /APOE:\s*([E][0-9]\/[E][0-9])/gi, name: 'APOE' },
      // FADS variants (omega fatty acid metabolism)
      { regex: /FADS[12]?\s+([A-Z]{1,2}|rs174547|rs174556)/gi, name: 'FADS' },
      // LDLR (LDL receptor)
      { regex: /LDLR\s+([A-Z]{1,2}|rs6511720)/gi, name: 'LDLR' },
      // PCSK9 (cholesterol metabolism)
      { regex: /PCSK9\s+([A-Z]{1,2}|rs11591147)/gi, name: 'PCSK9' },
      // APOA1/APOA5 (HDL metabolism)
      { regex: /APOA[15]\s+([A-Z]{1,2}|rs670|rs3135506)/gi, name: 'APOA' },
      // LPL (lipoprotein lipase)
      { regex: /LPL\s+([A-Z]{1,2}|rs328)/gi, name: 'LPL' },
      // CETP (cholesteryl ester transfer)
      { regex: /CETP\s+([A-Z]{1,2}|rs708272)/gi, name: 'CETP' },
      // LIPC (hepatic lipase)
      { regex: /LIPC\s+([A-Z]{1,2}|rs1800588)/gi, name: 'LIPC' },
      // NPC1L1 (cholesterol absorption)
      { regex: /NPC1L1\s+([A-Z]{1,2}|rs217434)/gi, name: 'NPC1L1' },
      // CD36 (fatty acid transport)
      { regex: /CD36\s+([A-Z]{1,2}|rs1761667)/gi, name: 'CD36' },
      // ELOVL2/ELOVL5 (fatty acid synthesis)
      { regex: /ELOVL[25]\s+([A-Z]{1,2}|rs953413)/gi, name: 'ELOVL' },
      // SCD1 (fatty acid desaturation)
      { regex: /SCD1\s+([A-Z]{1,2}|rs2060792)/gi, name: 'SCD1' },
      // ACE (cardiovascular)
      { regex: /ACE\s+([A-Z]{1,2}|I\/D|rs4646994)/gi, name: 'ACE' },
      // AGT (angiotensinogen)
      { regex: /AGT\s+([A-Z]{1,2}|rs699)/gi, name: 'AGT' },
      // NOS3 (nitric oxide)
      { regex: /NOS3\s+([A-Z]{1,2}|rs1799983)/gi, name: 'NOS3' },
      
      // === DRUG/SUPPLEMENT METABOLISM ===
      // CYP variants (drug/supplement metabolism)
      { regex: /CYP1A2\s+([A-Z]{1,2}|rs762551|\*1F)/gi, name: 'CYP1A2' },
      { regex: /CYP2D6\s+([A-Z*]{1,4}|rs1065852)/gi, name: 'CYP2D6' },
      { regex: /CYP3A4\s+([A-Z]{1,2}|rs2740574)/gi, name: 'CYP3A4' },
      { regex: /CYP2C9\s+([A-Z*]{1,4}|rs1799853)/gi, name: 'CYP2C9' },
      { regex: /CYP2C19\s+([A-Z*]{1,4}|rs4244285)/gi, name: 'CYP2C19' },
      // UGT variants (glucuronidation)
      { regex: /UGT[12][AB][0-9]+\s+([A-Z*]{1,4}|rs[0-9]+)/gi, name: 'UGT' },
      // SULT variants (sulfation)
      { regex: /SULT[12][AB][0-9]+\s+([A-Z]{1,2}|rs[0-9]+)/gi, name: 'SULT' },
      // NAT1/NAT2 (acetylation)
      { regex: /NAT[12]\s+([A-Z*]{1,4}|rs1801280)/gi, name: 'NAT' },
      // ABCB1 (P-glycoprotein transport)
      { regex: /ABCB1\s+([A-Z]{1,2}|rs1045642)/gi, name: 'ABCB1' },
      // ABCA1 (cholesterol transport)
      { regex: /ABCA1\s+([A-Z]{1,2}|rs9282541)/gi, name: 'ABCA1' },
      // SLCO1B1 (statin interactions, CoQ10 needs)
      { regex: /SLCO1B1\s+([A-Z]{1,2}|rs4149056)/gi, name: 'SLCO1B1' },
      
      // === INFLAMMATION & IMMUNE ===
      // IL6/IL1B (inflammation)
      { regex: /IL[16]B?\s+([A-Z]{1,2}|rs1800795|rs16944)/gi, name: 'IL' },
      // TNF (tumor necrosis factor)
      { regex: /TNF\s+([A-Z]{1,2}|rs1800629)/gi, name: 'TNF' },
      // CRP (C-reactive protein)
      { regex: /CRP\s+([A-Z]{1,2}|rs1205)/gi, name: 'CRP' },
      
      // === CIRCADIAN & SLEEP ===
      // CLOCK/PER2 (circadian rhythm, melatonin needs)
      { regex: /(?:CLOCK|PER2)\s+([A-Z]{1,2}|rs1801260|rs2304672)/gi, name: 'CIRCADIAN' },
      // AANAT (melatonin production)
      { regex: /AANAT\s+([A-Z]{1,2}|rs3760138)/gi, name: 'AANAT' },
      
      // === METABOLIC & HORMONAL ===
      // PPARA/PPARG (metabolism)
      { regex: /PPAR[AG]\s+([A-Z]{1,2}|rs1801282|rs4253778)/gi, name: 'PPAR' },
      // ADIPOQ (adiponectin)
      { regex: /ADIPOQ\s+([A-Z]{1,2}|rs2241766)/gi, name: 'ADIPOQ' },
      // LEP/LEPR (leptin)
      { regex: /LEP[R]?\s+([A-Z]{1,2}|rs7799039|rs1137101)/gi, name: 'LEP' },
      
      // === OTHER IMPORTANT PATHWAYS ===
      // CBS (sulfur metabolism, B6 needs)
      { regex: /CBS\s+([A-Z]{1,2}|rs234706)/gi, name: 'CBS' },
      // PEMT (choline metabolism)
      { regex: /PEMT\s+([A-Z]{1,2}|rs7946)/gi, name: 'PEMT' },
      // ALDH2 (alcohol metabolism, affects B-vitamin needs)
      { regex: /ALDH2\s+([A-Z]{1,2}|rs671)/gi, name: 'ALDH2' },
      // EPHX1 (epoxide hydrolase)
      { regex: /EPHX1\s+([A-Z]{1,2}|rs1051740)/gi, name: 'EPHX1' },
      // QDPR/GCH1/SPR (BH4 pathway)
      { regex: /(?:QDPR|GCH1|SPR)\s+([A-Z]{1,2}|rs2071130)/gi, name: 'BH4' },
      // NADSYN1/NMNAT (NAD synthesis)
      { regex: /(?:NADSYN1|NMNAT[12])\s+([A-Z]{1,2}|rs2276731)/gi, name: 'NAD' },
      
      // Generic rsID patterns for any other relevant SNPs
      { regex: /(rs\d+):\s*([A-Z]{1,2})/gi, name: 'SNP' }
    ];

    // Extract all genetic variants
    geneticPatterns.forEach(pattern => {
      const matches = geneticText.matchAll(pattern.regex);
      for (const match of matches) {
        if (pattern.name === 'SNP') {
          // For generic rsIDs
          const [, rsid, genotype] = match;
          if (rsid && genotype) {
            geneticVariants.push(`${rsid}: ${genotype}`);
          }
        } else if (pattern.name === 'MTHFR') {
          // For MTHFR variants
          const [, variant, genotype] = match;
          if (variant && genotype && genotype !== 'CC' && genotype !== 'AA') {
            geneticVariants.push(`MTHFR ${variant}: ${genotype}`);
          }
        } else if (pattern.name === 'APOE') {
          // For APOE variants
          const [, variant] = match;
          if (variant && variant !== 'E3/E3') {
            geneticVariants.push(`APOE: ${variant}`);
          }
        } else {
          // For all other variants
          const [fullMatch] = match;
          if (fullMatch) {
            geneticVariants.push(fullMatch.trim());
          }
        }
      }
    });

    // Extract biomarker findings from biomarker_reasoning or recommendation_reason
    const biomarkerText = rec.biomarker_reasoning || rec.recommendation_reason || '';
    
    // Comprehensive biomarker patterns
    const biomarkerPatterns = [
      // === VITAMINS (Fat-Soluble) ===
      { regex: /vitamin\s+d[^:]*:\s*([0-9.]+)/i, name: 'Vitamin D' },
      { regex: /25\s*\(\s*oh\s*\)\s*d[^:]*:\s*([0-9.]+)/i, name: '25(OH)D' },
      { regex: /1,25\s*\(\s*oh\s*\)\s*d[^:]*:\s*([0-9.]+)/i, name: '1,25(OH)D' },
      { regex: /vitamin\s+a[^:]*:\s*([0-9.]+)/i, name: 'Vitamin A' },
      { regex: /retinol[^:]*:\s*([0-9.]+)/i, name: 'Retinol' },
      { regex: /beta[\s-]?carotene[^:]*:\s*([0-9.]+)/i, name: 'Beta-Carotene' },
      { regex: /vitamin\s+e[^:]*:\s*([0-9.]+)/i, name: 'Vitamin E' },
      { regex: /alpha[\s-]?tocopherol[^:]*:\s*([0-9.]+)/i, name: 'Alpha-Tocopherol' },
      { regex: /gamma[\s-]?tocopherol[^:]*:\s*([0-9.]+)/i, name: 'Gamma-Tocopherol' },
      { regex: /vitamin\s+k[^:]*:\s*([0-9.]+)/i, name: 'Vitamin K' },
      { regex: /vitamin\s+k1[^:]*:\s*([0-9.]+)/i, name: 'Vitamin K1' },
      { regex: /vitamin\s+k2[^:]*:\s*([0-9.]+)/i, name: 'Vitamin K2' },
      { regex: /mk[47][^:]*:\s*([0-9.]+)/i, name: 'MK-7' },
      
      // === VITAMINS (Water-Soluble) ===
      { regex: /vitamin\s+c[^:]*:\s*([0-9.]+)/i, name: 'Vitamin C' },
      { regex: /ascorbic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Ascorbic Acid' },
      
      // === B-VITAMINS ===
      { regex: /thiamine[^:]*:\s*([0-9.]+)/i, name: 'B1 (Thiamine)' },
      { regex: /vitamin\s+b1[^:]*:\s*([0-9.]+)/i, name: 'B1' },
      { regex: /riboflavin[^:]*:\s*([0-9.]+)/i, name: 'B2 (Riboflavin)' },
      { regex: /vitamin\s+b2[^:]*:\s*([0-9.]+)/i, name: 'B2' },
      { regex: /niacin[^:]*:\s*([0-9.]+)/i, name: 'B3 (Niacin)' },
      { regex: /nicotinic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Nicotinic Acid' },
      { regex: /vitamin\s+b3[^:]*:\s*([0-9.]+)/i, name: 'B3' },
      { regex: /pantothenic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'B5 (Pantothenic Acid)' },
      { regex: /vitamin\s+b5[^:]*:\s*([0-9.]+)/i, name: 'B5' },
      { regex: /pyridoxine[^:]*:\s*([0-9.]+)/i, name: 'B6 (Pyridoxine)' },
      { regex: /pyridoxal[^:]*:\s*([0-9.]+)/i, name: 'Pyridoxal' },
      { regex: /vitamin\s+b6[^:]*:\s*([0-9.]+)/i, name: 'B6' },
      { regex: /biotin[^:]*:\s*([0-9.]+)/i, name: 'B7 (Biotin)' },
      { regex: /vitamin\s+b7[^:]*:\s*([0-9.]+)/i, name: 'B7' },
      { regex: /folate[^:]*:\s*([0-9.]+)/i, name: 'B9 (Folate)' },
      { regex: /folic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Folic Acid' },
      { regex: /5[\s-]?mthf[^:]*:\s*([0-9.]+)/i, name: '5-MTHF' },
      { regex: /methylfolate[^:]*:\s*([0-9.]+)/i, name: 'Methylfolate' },
      { regex: /vitamin\s+b9[^:]*:\s*([0-9.]+)/i, name: 'B9' },
      { regex: /b12[^:]*:\s*([0-9.]+)/i, name: 'B12' },
      { regex: /cobalamin[^:]*:\s*([0-9.]+)/i, name: 'Cobalamin' },
      { regex: /methylcobalamin[^:]*:\s*([0-9.]+)/i, name: 'Methylcobalamin' },
      { regex: /cyanocobalamin[^:]*:\s*([0-9.]+)/i, name: 'Cyanocobalamin' },
      { regex: /holotranscobalamin[^:]*:\s*([0-9.]+)/i, name: 'Holotranscobalamin' },
      { regex: /vitamin\s+b12[^:]*:\s*([0-9.]+)/i, name: 'B12' },
      
      // === MINERALS (Macrominerals) ===
      { regex: /calcium[^:]*:\s*([0-9.]+)/i, name: 'Calcium' },
      { regex: /phosphorus[^:]*:\s*([0-9.]+)/i, name: 'Phosphorus' },
      { regex: /phosphate[^:]*:\s*([0-9.]+)/i, name: 'Phosphate' },
      { regex: /magnesium[^:]*:\s*([0-9.]+)/i, name: 'Magnesium' },
      { regex: /rbc\s+magnesium[^:]*:\s*([0-9.]+)/i, name: 'RBC Magnesium' },
      { regex: /sodium[^:]*:\s*([0-9.]+)/i, name: 'Sodium' },
      { regex: /potassium[^:]*:\s*([0-9.]+)/i, name: 'Potassium' },
      { regex: /chloride[^:]*:\s*([0-9.]+)/i, name: 'Chloride' },
      { regex: /sulfate[^:]*:\s*([0-9.]+)/i, name: 'Sulfate' },
      
      // === MINERALS (Trace Elements) ===
      { regex: /iron[^:]*:\s*([0-9.]+)/i, name: 'Iron' },
      { regex: /ferritin[^:]*:\s*([0-9.]+)/i, name: 'Ferritin' },
      { regex: /transferrin[^:]*:\s*([0-9.]+)/i, name: 'Transferrin' },
      { regex: /tibc[^:]*:\s*([0-9.]+)/i, name: 'TIBC' },
      { regex: /transferrin\s+saturation[^:]*:\s*([0-9.]+)/i, name: 'Transferrin Saturation' },
      { regex: /zinc[^:]*:\s*([0-9.]+)/i, name: 'Zinc' },
      { regex: /rbc\s+zinc[^:]*:\s*([0-9.]+)/i, name: 'RBC Zinc' },
      { regex: /copper[^:]*:\s*([0-9.]+)/i, name: 'Copper' },
      { regex: /ceruloplasmin[^:]*:\s*([0-9.]+)/i, name: 'Ceruloplasmin' },
      { regex: /selenium[^:]*:\s*([0-9.]+)/i, name: 'Selenium' },
      { regex: /iodine[^:]*:\s*([0-9.]+)/i, name: 'Iodine' },
      { regex: /manganese[^:]*:\s*([0-9.]+)/i, name: 'Manganese' },
      { regex: /chromium[^:]*:\s*([0-9.]+)/i, name: 'Chromium' },
      { regex: /molybdenum[^:]*:\s*([0-9.]+)/i, name: 'Molybdenum' },
      { regex: /cobalt[^:]*:\s*([0-9.]+)/i, name: 'Cobalt' },
      { regex: /vanadium[^:]*:\s*([0-9.]+)/i, name: 'Vanadium' },
      { regex: /boron[^:]*:\s*([0-9.]+)/i, name: 'Boron' },
      { regex: /fluoride[^:]*:\s*([0-9.]+)/i, name: 'Fluoride' },
      { regex: /lithium[^:]*:\s*([0-9.]+)/i, name: 'Lithium' },
      { regex: /silicon[^:]*:\s*([0-9.]+)/i, name: 'Silicon' },
      
      // === HORMONES (Thyroid) ===
      { regex: /tsh[^:]*:\s*([0-9.]+)/i, name: 'TSH' },
      { regex: /t4[^:]*:\s*([0-9.]+)/i, name: 'T4' },
      { regex: /free\s+t4[^:]*:\s*([0-9.]+)/i, name: 'Free T4' },
      { regex: /t3[^:]*:\s*([0-9.]+)/i, name: 'T3' },
      { regex: /free\s+t3[^:]*:\s*([0-9.]+)/i, name: 'Free T3' },
      { regex: /reverse\s+t3[^:]*:\s*([0-9.]+)/i, name: 'Reverse T3' },
      { regex: /rt3[^:]*:\s*([0-9.]+)/i, name: 'rT3' },
      { regex: /thyroglobulin[^:]*:\s*([0-9.]+)/i, name: 'Thyroglobulin' },
      { regex: /anti[\s-]?tpo[^:]*:\s*([0-9.]+)/i, name: 'Anti-TPO' },
      { regex: /anti[\s-]?thyroglobulin[^:]*:\s*([0-9.]+)/i, name: 'Anti-Thyroglobulin' },
      
      // === HORMONES (Sex Hormones) ===
      { regex: /testosterone[^:]*:\s*([0-9.]+)/i, name: 'Testosterone' },
      { regex: /free\s+testosterone[^:]*:\s*([0-9.]+)/i, name: 'Free Testosterone' },
      { regex: /bioavailable\s+testosterone[^:]*:\s*([0-9.]+)/i, name: 'Bioavailable Testosterone' },
      { regex: /shbg[^:]*:\s*([0-9.]+)/i, name: 'SHBG' },
      { regex: /estradiol[^:]*:\s*([0-9.]+)/i, name: 'Estradiol' },
      { regex: /estrone[^:]*:\s*([0-9.]+)/i, name: 'Estrone' },
      { regex: /estriol[^:]*:\s*([0-9.]+)/i, name: 'Estriol' },
      { regex: /progesterone[^:]*:\s*([0-9.]+)/i, name: 'Progesterone' },
      { regex: /dhea[^:]*:\s*([0-9.]+)/i, name: 'DHEA' },
      { regex: /dhea[\s-]?s[^:]*:\s*([0-9.]+)/i, name: 'DHEA-S' },
      { regex: /androstenedione[^:]*:\s*([0-9.]+)/i, name: 'Androstenedione' },
      { regex: /dht[^:]*:\s*([0-9.]+)/i, name: 'DHT' },
      { regex: /prolactin[^:]*:\s*([0-9.]+)/i, name: 'Prolactin' },
      { regex: /lh[^:]*:\s*([0-9.]+)/i, name: 'LH' },
      { regex: /fsh[^:]*:\s*([0-9.]+)/i, name: 'FSH' },
      
      // === HORMONES (Adrenal & Stress) ===
      { regex: /cortisol[^:]*:\s*([0-9.]+)/i, name: 'Cortisol' },
      { regex: /am\s+cortisol[^:]*:\s*([0-9.]+)/i, name: 'AM Cortisol' },
      { regex: /pm\s+cortisol[^:]*:\s*([0-9.]+)/i, name: 'PM Cortisol' },
      { regex: /aldosterone[^:]*:\s*([0-9.]+)/i, name: 'Aldosterone' },
      { regex: /acth[^:]*:\s*([0-9.]+)/i, name: 'ACTH' },
      { regex: /adrenaline[^:]*:\s*([0-9.]+)/i, name: 'Adrenaline' },
      { regex: /epinephrine[^:]*:\s*([0-9.]+)/i, name: 'Epinephrine' },
      { regex: /noradrenaline[^:]*:\s*([0-9.]+)/i, name: 'Noradrenaline' },
      { regex: /norepinephrine[^:]*:\s*([0-9.]+)/i, name: 'Norepinephrine' },
      { regex: /dopamine[^:]*:\s*([0-9.]+)/i, name: 'Dopamine' },
      { regex: /serotonin[^:]*:\s*([0-9.]+)/i, name: 'Serotonin' },
      
      // === HORMONES (Other) ===
      { regex: /insulin[^:]*:\s*([0-9.]+)/i, name: 'Insulin' },
      { regex: /c[\s-]?peptide[^:]*:\s*([0-9.]+)/i, name: 'C-Peptide' },
      { regex: /growth\s+hormone[^:]*:\s*([0-9.]+)/i, name: 'Growth Hormone' },
      { regex: /igf[\s-]?1[^:]*:\s*([0-9.]+)/i, name: 'IGF-1' },
      { regex: /melatonin[^:]*:\s*([0-9.]+)/i, name: 'Melatonin' },
      { regex: /parathyroid\s+hormone[^:]*:\s*([0-9.]+)/i, name: 'PTH' },
      { regex: /pth[^:]*:\s*([0-9.]+)/i, name: 'PTH' },
      { regex: /calcitonin[^:]*:\s*([0-9.]+)/i, name: 'Calcitonin' },
      
      // === LIPIDS ===
      { regex: /total\s+cholesterol[^:]*:\s*([0-9.]+)/i, name: 'Total Cholesterol' },
      { regex: /cholesterol[^:]*:\s*([0-9.]+)/i, name: 'Cholesterol' },
      { regex: /ldl[^:]*:\s*([0-9.]+)/i, name: 'LDL' },
      { regex: /hdl[^:]*:\s*([0-9.]+)/i, name: 'HDL' },
      { regex: /vldl[^:]*:\s*([0-9.]+)/i, name: 'VLDL' },
      { regex: /triglycerides[^:]*:\s*([0-9.]+)/i, name: 'Triglycerides' },
      { regex: /apolipoprotein\s+a[^:]*:\s*([0-9.]+)/i, name: 'ApoA' },
      { regex: /apolipoprotein\s+b[^:]*:\s*([0-9.]+)/i, name: 'ApoB' },
      { regex: /lp\(a\)[^:]*:\s*([0-9.]+)/i, name: 'Lp(a)' },
      { regex: /lipoprotein\s+a[^:]*:\s*([0-9.]+)/i, name: 'Lipoprotein(a)' },
      { regex: /small\s+dense\s+ldl[^:]*:\s*([0-9.]+)/i, name: 'Small Dense LDL' },
      { regex: /ldl\s+particle\s+number[^:]*:\s*([0-9.]+)/i, name: 'LDL Particle Number' },
      { regex: /hdl\s+particle\s+number[^:]*:\s*([0-9.]+)/i, name: 'HDL Particle Number' },
      
      // === METABOLIC ===
      { regex: /glucose[^:]*:\s*([0-9.]+)/i, name: 'Glucose' },
      { regex: /fasting\s+glucose[^:]*:\s*([0-9.]+)/i, name: 'Fasting Glucose' },
      { regex: /hemoglobin\s*a1c[^:]*:\s*([0-9.]+)/i, name: 'HbA1c' },
      { regex: /hba1c[^:]*:\s*([0-9.]+)/i, name: 'HbA1c' },
      { regex: /fructosamine[^:]*:\s*([0-9.]+)/i, name: 'Fructosamine' },
      { regex: /lactate[^:]*:\s*([0-9.]+)/i, name: 'Lactate' },
      { regex: /pyruvate[^:]*:\s*([0-9.]+)/i, name: 'Pyruvate' },
      { regex: /ketones[^:]*:\s*([0-9.]+)/i, name: 'Ketones' },
      { regex: /beta[\s-]?hydroxybutyrate[^:]*:\s*([0-9.]+)/i, name: 'Beta-Hydroxybutyrate' },
      
      // === BLOOD COUNT ===
      { regex: /hemoglobin[^:]*:\s*([0-9.]+)/i, name: 'Hemoglobin' },
      { regex: /hematocrit[^:]*:\s*([0-9.]+)/i, name: 'Hematocrit' },
      { regex: /mcv[^:]*:\s*([0-9.]+)/i, name: 'MCV' },
      { regex: /mch[^:]*:\s*([0-9.]+)/i, name: 'MCH' },
      { regex: /mchc[^:]*:\s*([0-9.]+)/i, name: 'MCHC' },
      { regex: /rdw[^:]*:\s*([0-9.]+)/i, name: 'RDW' },
      { regex: /rbc[^:]*:\s*([0-9.]+)/i, name: 'RBC' },
      { regex: /wbc[^:]*:\s*([0-9.]+)/i, name: 'WBC' },
      { regex: /platelets[^:]*:\s*([0-9.]+)/i, name: 'Platelets' },
      { regex: /neutrophils[^:]*:\s*([0-9.]+)/i, name: 'Neutrophils' },
      { regex: /lymphocytes[^:]*:\s*([0-9.]+)/i, name: 'Lymphocytes' },
      { regex: /monocytes[^:]*:\s*([0-9.]+)/i, name: 'Monocytes' },
      { regex: /eosinophils[^:]*:\s*([0-9.]+)/i, name: 'Eosinophils' },
      { regex: /basophils[^:]*:\s*([0-9.]+)/i, name: 'Basophils' },
      { regex: /reticulocytes[^:]*:\s*([0-9.]+)/i, name: 'Reticulocytes' },
      
      // === KIDNEY FUNCTION ===
      { regex: /creatinine[^:]*:\s*([0-9.]+)/i, name: 'Creatinine' },
      { regex: /bun[^:]*:\s*([0-9.]+)/i, name: 'BUN' },
      { regex: /urea[^:]*:\s*([0-9.]+)/i, name: 'Urea' },
      { regex: /uric\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Uric Acid' },
      { regex: /egfr[^:]*:\s*([0-9.]+)/i, name: 'eGFR' },
      { regex: /cystatin\s+c[^:]*:\s*([0-9.]+)/i, name: 'Cystatin C' },
      { regex: /microalbumin[^:]*:\s*([0-9.]+)/i, name: 'Microalbumin' },
      
      // === LIVER FUNCTION ===
      { regex: /alt[^:]*:\s*([0-9.]+)/i, name: 'ALT' },
      { regex: /ast[^:]*:\s*([0-9.]+)/i, name: 'AST' },
      { regex: /alp[^:]*:\s*([0-9.]+)/i, name: 'ALP' },
      { regex: /alkaline\s+phosphatase[^:]*:\s*([0-9.]+)/i, name: 'Alkaline Phosphatase' },
      { regex: /ggt[^:]*:\s*([0-9.]+)/i, name: 'GGT' },
      { regex: /bilirubin[^:]*:\s*([0-9.]+)/i, name: 'Bilirubin' },
      { regex: /direct\s+bilirubin[^:]*:\s*([0-9.]+)/i, name: 'Direct Bilirubin' },
      { regex: /indirect\s+bilirubin[^:]*:\s*([0-9.]+)/i, name: 'Indirect Bilirubin' },
      { regex: /albumin[^:]*:\s*([0-9.]+)/i, name: 'Albumin' },
      { regex: /total\s+protein[^:]*:\s*([0-9.]+)/i, name: 'Total Protein' },
      { regex: /globulin[^:]*:\s*([0-9.]+)/i, name: 'Globulin' },
      
      // === INFLAMMATION ===
      { regex: /crp[^:]*:\s*([0-9.]+)/i, name: 'CRP' },
      { regex: /hs[\s-]?crp[^:]*:\s*([0-9.]+)/i, name: 'hs-CRP' },
      { regex: /esr[^:]*:\s*([0-9.]+)/i, name: 'ESR' },
      { regex: /sed\s+rate[^:]*:\s*([0-9.]+)/i, name: 'Sed Rate' },
      { regex: /fibrinogen[^:]*:\s*([0-9.]+)/i, name: 'Fibrinogen' },
      { regex: /ferritin[^:]*:\s*([0-9.]+)/i, name: 'Ferritin' },
      
      // === AMINO ACIDS ===
      { regex: /homocysteine[^:]*:\s*([0-9.]+)/i, name: 'Homocysteine' },
      { regex: /methionine[^:]*:\s*([0-9.]+)/i, name: 'Methionine' },
      { regex: /cysteine[^:]*:\s*([0-9.]+)/i, name: 'Cysteine' },
      { regex: /taurine[^:]*:\s*([0-9.]+)/i, name: 'Taurine' },
      { regex: /glycine[^:]*:\s*([0-9.]+)/i, name: 'Glycine' },
      { regex: /serine[^:]*:\s*([0-9.]+)/i, name: 'Serine' },
      { regex: /glutamine[^:]*:\s*([0-9.]+)/i, name: 'Glutamine' },
      { regex: /glutamate[^:]*:\s*([0-9.]+)/i, name: 'Glutamate' },
      { regex: /arginine[^:]*:\s*([0-9.]+)/i, name: 'Arginine' },
      { regex: /ornithine[^:]*:\s*([0-9.]+)/i, name: 'Ornithine' },
      { regex: /citrulline[^:]*:\s*([0-9.]+)/i, name: 'Citrulline' },
      { regex: /lysine[^:]*:\s*([0-9.]+)/i, name: 'Lysine' },
      { regex: /histidine[^:]*:\s*([0-9.]+)/i, name: 'Histidine' },
      { regex: /tryptophan[^:]*:\s*([0-9.]+)/i, name: 'Tryptophan' },
      { regex: /tyrosine[^:]*:\s*([0-9.]+)/i, name: 'Tyrosine' },
      { regex: /phenylalanine[^:]*:\s*([0-9.]+)/i, name: 'Phenylalanine' },
      { regex: /leucine[^:]*:\s*([0-9.]+)/i, name: 'Leucine' },
      { regex: /isoleucine[^:]*:\s*([0-9.]+)/i, name: 'Isoleucine' },
      { regex: /valine[^:]*:\s*([0-9.]+)/i, name: 'Valine' },
      { regex: /threonine[^:]*:\s*([0-9.]+)/i, name: 'Threonine' },
      { regex: /proline[^:]*:\s*([0-9.]+)/i, name: 'Proline' },
      { regex: /alanine[^:]*:\s*([0-9.]+)/i, name: 'Alanine' },
      { regex: /aspartic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Aspartic Acid' },
      { regex: /asparagine[^:]*:\s*([0-9.]+)/i, name: 'Asparagine' },
      { regex: /glutathione[^:]*:\s*([0-9.]+)/i, name: 'Glutathione' },
      { regex: /carnitine[^:]*:\s*([0-9.]+)/i, name: 'Carnitine' },
      { regex: /acetyl[\s-]?l[\s-]?carnitine[^:]*:\s*([0-9.]+)/i, name: 'Acetyl-L-Carnitine' },
      
      // === FATTY ACIDS ===
      { regex: /omega[^:]*3[^:]*:\s*([0-9.]+)/i, name: 'Omega-3' },
      { regex: /omega[^:]*6[^:]*:\s*([0-9.]+)/i, name: 'Omega-6' },
      { regex: /dha[^:]*:\s*([0-9.]+)/i, name: 'DHA' },
      { regex: /epa[^:]*:\s*([0-9.]+)/i, name: 'EPA' },
      { regex: /ala[^:]*:\s*([0-9.]+)/i, name: 'ALA' },
      { regex: /arachidonic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Arachidonic Acid' },
      { regex: /linoleic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Linoleic Acid' },
      { regex: /oleic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Oleic Acid' },
      { regex: /palmitic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Palmitic Acid' },
      { regex: /stearic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Stearic Acid' },
      { regex: /omega[^:]*3\s+index[^:]*:\s*([0-9.]+)/i, name: 'Omega-3 Index' },
      
      // === SPECIALIZED METABOLIC MARKERS ===
      { regex: /coq10[^:]*:\s*([0-9.]+)/i, name: 'CoQ10' },
      { regex: /coenzyme\s+q10[^:]*:\s*([0-9.]+)/i, name: 'Coenzyme Q10' },
      { regex: /lipoic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Lipoic Acid' },
      { regex: /mma[^:]*:\s*([0-9.]+)/i, name: 'MMA' },
      { regex: /methylmalonic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Methylmalonic Acid' },
      { regex: /ammonia[^:]*:\s*([0-9.]+)/i, name: 'Ammonia' },
      { regex: /choline[^:]*:\s*([0-9.]+)/i, name: 'Choline' },
      { regex: /betaine[^:]*:\s*([0-9.]+)/i, name: 'Betaine' },
      { regex: /tmao[^:]*:\s*([0-9.]+)/i, name: 'TMAO' },
      { regex: /trimethylamine[^:]*:\s*([0-9.]+)/i, name: 'Trimethylamine' },
      { regex: /same[^:]*:\s*([0-9.]+)/i, name: 'SAMe' },
      { regex: /s[\s-]?adenosyl[\s-]?methionine[^:]*:\s*([0-9.]+)/i, name: 'S-Adenosyl-Methionine' },
      { regex: /adenosine[^:]*:\s*([0-9.]+)/i, name: 'Adenosine' },
      { regex: /nad\+[^:]*:\s*([0-9.]+)/i, name: 'NAD+' },
      { regex: /nadh[^:]*:\s*([0-9.]+)/i, name: 'NADH' },
      
      // === ORGANIC ACIDS ===
      { regex: /citric\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Citric Acid' },
      { regex: /succinic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Succinic Acid' },
      { regex: /fumaric\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Fumaric Acid' },
      { regex: /malic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Malic Acid' },
      { regex: /alpha[\s-]?ketoglutaric[^:]*:\s*([0-9.]+)/i, name: 'Alpha-Ketoglutaric Acid' },
      { regex: /oxaloacetic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Oxaloacetic Acid' },
      { regex: /isocitric\s+acid[^:]*:\s*([0-9.]+)/i, name: 'Isocitric Acid' },
      
      // === NEUROTRANSMITTER METABOLITES ===
      { regex: /vanillylmandelic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'VMA' },
      { regex: /vma[^:]*:\s*([0-9.]+)/i, name: 'VMA' },
      { regex: /homovanillic\s+acid[^:]*:\s*([0-9.]+)/i, name: 'HVA' },
      { regex: /hva[^:]*:\s*([0-9.]+)/i, name: 'HVA' },
      { regex: /5[\s-]?hiaa[^:]*:\s*([0-9.]+)/i, name: '5-HIAA' },
      { regex: /5[\s-]?hydroxyindoleacetic[^:]*:\s*([0-9.]+)/i, name: '5-HIAA' },
      { regex: /dopac[^:]*:\s*([0-9.]+)/i, name: 'DOPAC' },
      { regex: /3[\s-]?methoxy[\s-]?4[\s-]?hydroxyphenylglycol[^:]*:\s*([0-9.]+)/i, name: 'MHPG' },
      { regex: /mhpg[^:]*:\s*([0-9.]+)/i, name: 'MHPG' },
      
      // === TOXIC METALS ===
      { regex: /lead[^:]*:\s*([0-9.]+)/i, name: 'Lead' },
      { regex: /mercury[^:]*:\s*([0-9.]+)/i, name: 'Mercury' },
      { regex: /cadmium[^:]*:\s*([0-9.]+)/i, name: 'Cadmium' },
      { regex: /arsenic[^:]*:\s*([0-9.]+)/i, name: 'Arsenic' },
      { regex: /aluminum[^:]*:\s*([0-9.]+)/i, name: 'Aluminum' },
      { regex: /nickel[^:]*:\s*([0-9.]+)/i, name: 'Nickel' },
      { regex: /tin[^:]*:\s*([0-9.]+)/i, name: 'Tin' },
      { regex: /uranium[^:]*:\s*([0-9.]+)/i, name: 'Uranium' },
      { regex: /thallium[^:]*:\s*([0-9.]+)/i, name: 'Thallium' },
      
      // === CARDIOVASCULAR MARKERS ===
      { regex: /bnp[^:]*:\s*([0-9.]+)/i, name: 'BNP' },
      { regex: /nt[\s-]?pro[\s-]?bnp[^:]*:\s*([0-9.]+)/i, name: 'NT-proBNP' },
      { regex: /troponin[^:]*:\s*([0-9.]+)/i, name: 'Troponin' },
      { regex: /d[\s-]?dimer[^:]*:\s*([0-9.]+)/i, name: 'D-Dimer' },
      
      // === ANTIOXIDANT MARKERS ===
      { regex: /total\s+antioxidant\s+capacity[^:]*:\s*([0-9.]+)/i, name: 'Total Antioxidant Capacity' },
      { regex: /orac[^:]*:\s*([0-9.]+)/i, name: 'ORAC' },
      { regex: /malondialdehyde[^:]*:\s*([0-9.]+)/i, name: 'Malondialdehyde' },
      { regex: /8[\s-]?hydroxy[\s-]?2[\s-]?deoxyguanosine[^:]*:\s*([0-9.]+)/i, name: '8-OHdG' },
      { regex: /superoxide\s+dismutase[^:]*:\s*([0-9.]+)/i, name: 'SOD' },
      { regex: /catalase[^:]*:\s*([0-9.]+)/i, name: 'Catalase' },
      { regex: /glutathione\s+peroxidase[^:]*:\s*([0-9.]+)/i, name: 'Glutathione Peroxidase' }
    ];

    biomarkerPatterns.forEach(pattern => {
      const match = biomarkerText.match(pattern.regex);
      if (match) {
        biomarkerFindings.push(`${pattern.name}: ${match[1]}`);
      }
    });

    // Look for status flags (HIGH, LOW, ELEVATED, DEFICIENT)
    const flaggedBiomarkers = biomarkerText.match(/(\w+(?:\s+\w+)*)\s+(HIGH|LOW|ELEVATED|DEFICIENT|SUBOPTIMAL|OPTIMAL)/gi);
    if (flaggedBiomarkers) {
      flaggedBiomarkers.forEach(flag => {
        const [, biomarker, status] = flag.match(/(\w+(?:\s+\w+)*)\s+(HIGH|LOW|ELEVATED|DEFICIENT|SUBOPTIMAL|OPTIMAL)/i) || [];
        if (biomarker && status && status !== 'OPTIMAL') {
          biomarkerFindings.push(`${biomarker}: ${status}`);
        }
      });
    }

    // Remove duplicates and return
    return { 
      geneticVariants: [...new Set(geneticVariants)], 
      biomarkerFindings: [...new Set(biomarkerFindings)] 
    };
  };

  const { geneticVariants, biomarkerFindings } = extractPersonalizationDetails();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow flex flex-col h-full hover:shadow-lg transition-shadow">
      {product?.image_url ? (
        <div className="relative w-full h-40 mb-4">
          <Image 
            src={product.image_url} 
            alt={rec.supplement_name} 
            fill
            className="object-contain" 
            loading="lazy" 
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-40 mb-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          {/* Enhanced supplement emoji based on type */}
          <div className="text-6xl">
            {rec.supplement_name.toLowerCase().includes('vitamin d') ? '☀️' :
             rec.supplement_name.toLowerCase().includes('magnesium') ? '🧲' :
             rec.supplement_name.toLowerCase().includes('omega') || rec.supplement_name.toLowerCase().includes('fish') || rec.supplement_name.toLowerCase().includes('dha') ? '🐟' :
             rec.supplement_name.toLowerCase().includes('b12') || rec.supplement_name.toLowerCase().includes('b-12') ? '🔋' :
             rec.supplement_name.toLowerCase().includes('iron') ? '⚡' :
             rec.supplement_name.toLowerCase().includes('calcium') ? '🦴' :
             rec.supplement_name.toLowerCase().includes('zinc') ? '✨' :
             rec.supplement_name.toLowerCase().includes('vitamin c') ? '🍊' :
             rec.supplement_name.toLowerCase().includes('folate') || rec.supplement_name.toLowerCase().includes('folic') ? '🧬' :
             rec.supplement_name.toLowerCase().includes('betaine') || rec.supplement_name.toLowerCase().includes('tmg') ? '🔬' :
             rec.supplement_name.toLowerCase().includes('same') ? '⚗️' :
             rec.supplement_name.toLowerCase().includes('tyrosine') ? '🎯' :
             rec.supplement_name.toLowerCase().includes('theanine') ? '🍃' :
             rec.supplement_name.toLowerCase().includes('nac') ? '🛡️' :
             rec.supplement_name.toLowerCase().includes('selenium') ? '⚡' :
             rec.supplement_name.toLowerCase().includes('manganese') ? '🔋' :
             rec.supplement_name.toLowerCase().includes('curcumin') ? '🌶️' :
             rec.supplement_name.toLowerCase().includes('berberine') ? '🌿' :
             '💊'}
          </div>
        </div>
      )}
      
      {/* Enhanced Priority & Evidence Badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {rec.priority_score && (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            rec.priority_score >= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
            rec.priority_score >= 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
            'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
          }`}>
            {rec.priority_score >= 5 ? 'High Priority' : rec.priority_score >= 3 ? 'Medium Priority' : 'Low Priority'}
          </span>
        )}
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          rec.evidence_quality === 'high' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
          rec.evidence_quality === 'moderate' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {rec.evidence_quality === 'high' ? 'Strong Evidence' : rec.evidence_quality === 'moderate' ? 'Moderate Evidence' : 'Limited Evidence'}
        </span>
      </div>

      <h3 className="text-lg font-semibold mb-3 flex-1">{rec.supplement_name}</h3>

      {/* 🎯 ENHANCED PERSONALIZATION SHOWCASE - Make the personalized reasoning more prominent */}
      {(geneticVariants.length > 0 || biomarkerFindings.length > 0) && (
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-green-900/20 border-2 border-purple-200 dark:border-purple-800 p-4 rounded-xl mb-4 shadow-sm">
          <div className="text-sm font-bold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>Specifically Chosen For YOU</span>
          </div>
          
          {geneticVariants.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Dna className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Your Unique Genetics:</span>
              </div>
              <div className="grid gap-2">
                {geneticVariants.slice(0, 3).map((variant, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 px-3 py-2 rounded-lg">
                    <div className="font-mono text-xs text-purple-800 dark:text-purple-200 font-medium">
                      {variant}
                    </div>
                  </div>
                ))}
                {geneticVariants.length > 3 && (
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium px-3">
                    +{geneticVariants.length - 3} more genetic variants analyzed
                  </div>
                )}
              </div>
            </div>
          )}

          {biomarkerFindings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Your Current Lab Results:</span>
              </div>
              <div className="grid gap-2">
                {biomarkerFindings.slice(0, 3).map((finding, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 px-3 py-2 rounded-lg">
                    <div className="font-mono text-xs text-blue-800 dark:text-blue-200 font-medium">
                      {finding}
                    </div>
                  </div>
                ))}
                {biomarkerFindings.length > 3 && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium px-3">
                    +{biomarkerFindings.length - 3} more biomarkers analyzed
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 p-3 rounded-lg">
            <div className="text-xs text-green-800 dark:text-green-200 font-medium leading-relaxed">
              💡 <strong>Why This Works Best For You:</strong> This recommendation is precisely tailored to your unique biology - not a generic suggestion.
            </div>
          </div>
        </div>
      )}

      {/* Enhanced reasoning display with personalized highlighting */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg mb-4">
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
          <span>💬</span>
          <span>Our Personalized Recommendation</span>
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {rec.recommendation_reason?.split('.').map((sentence, idx) => {
            // Highlight key personalization phrases
            const isPersonalizedSentence = sentence.includes('we think') || 
                                         sentence.includes('we believe') || 
                                         sentence.includes('we chose') || 
                                         sentence.includes('we specifically') ||
                                         sentence.includes('for you') ||
                                         sentence.includes('your unique') ||
                                         sentence.includes('precisely tailored') ||
                                         sentence.includes('specifically chosen');
            
            if (isPersonalizedSentence && sentence.trim()) {
              return (
                <span key={idx} className="bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded font-medium">
                  {sentence.trim()}.
                </span>
              );
            }
            return sentence.trim() ? <span key={idx}>{sentence.trim()}. </span> : null;
          })}
        </div>
      </div>
      
      {/* Enhanced dosage display */}
      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dosage</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400">
              {rec.dosage_amount} {rec.dosage_unit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frequency</p>
            <p className="text-sm capitalize">{rec.frequency}</p>
          </div>
        </div>
        {rec.timing && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{rec.timing}</span>
          </div>
        )}
      </div>
      
      {/* Timeline from expected_benefits */}
      {rec.expected_benefits && rec.expected_benefits.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg mb-3">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
            ⏱️ {rec.expected_benefits[0]}
          </p>
        </div>
      )}
      
      {/* Enhanced comprehensive safety warnings display */}
      {(rec.contraindications && rec.contraindications.length > 0) || (rec.interaction_warnings && rec.interaction_warnings.length > 0) && (
        <div className="space-y-2 mb-3">
          {rec.interaction_warnings && rec.interaction_warnings.length > 0 && (
            rec.interaction_warnings.map((warning, idx) => {
              // Categorize warnings by type for appropriate styling
              const isAllergyWarning = warning.includes('❌ ALLERGY') || warning.toLowerCase().includes('allergy');
              const isDrugInteraction = warning.includes('⚠️ DRUG') || warning.toLowerCase().includes('medication');
              const isBiomarkerWarning = warning.includes('🩸 BIOMARKER') || warning.toLowerCase().includes('biomarker');
              const isGeneticWarning = warning.includes('🧬 GENETIC') || warning.toLowerCase().includes('genetic');
              const isAIWarning = warning.includes('🤖 AI') || warning.toLowerCase().includes('ai ');
              const isComplexInteraction = warning.includes('🚨 COMPLEX') || warning.toLowerCase().includes('complex');
              
              let bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
              let borderColor = 'border-yellow-200 dark:border-yellow-800';
              let textColor = 'text-yellow-700 dark:text-yellow-400';
              let icon = '⚠️';
              
              if (isAllergyWarning) {
                bgColor = 'bg-red-50 dark:bg-red-900/20';
                borderColor = 'border-red-200 dark:border-red-800';
                textColor = 'text-red-700 dark:text-red-400';
                icon = '❌';
              } else if (isGeneticWarning) {
                bgColor = 'bg-purple-50 dark:bg-purple-900/20';
                borderColor = 'border-purple-200 dark:border-purple-800';
                textColor = 'text-purple-700 dark:text-purple-400';
                icon = '🧬';
              } else if (isBiomarkerWarning) {
                bgColor = 'bg-blue-50 dark:bg-blue-900/20';
                borderColor = 'border-blue-200 dark:border-blue-800';
                textColor = 'text-blue-700 dark:text-blue-400';
                icon = '🩸';
              } else if (isAIWarning) {
                bgColor = 'bg-green-50 dark:bg-green-900/20';
                borderColor = 'border-green-200 dark:border-green-800';
                textColor = 'text-green-700 dark:text-green-400';
                icon = '🤖';
              } else if (isComplexInteraction) {
                bgColor = 'bg-orange-50 dark:bg-orange-900/20';
                borderColor = 'border-orange-200 dark:border-orange-800';
                textColor = 'text-orange-700 dark:text-orange-400';
                icon = '🚨';
              }
              
              return (
                <div key={idx} className={`${bgColor} border ${borderColor} p-2 rounded-lg`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{icon}</span>
                    <p className={`text-xs ${textColor} leading-relaxed`}>
                      {warning.replace(/^[^A-Z]*([A-Z])/, '$1')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          
          {rec.contraindications && rec.contraindications.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Safety Notes</p>
                  {rec.contraindications.slice(0, 2).map((contraindication, idx) => (
                    <p key={idx} className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      • {contraindication}
                    </p>
                  ))}
                  {rec.contraindications.length > 2 && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      +{rec.contraindications.length - 2} more safety notes
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitoring requirements */}
      {rec.monitoring_needed && rec.monitoring_needed.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-2 rounded-lg mb-3">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm">📊</span>
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Monitoring Required</p>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-400">
            {rec.monitoring_needed[0]}
            {rec.monitoring_needed.length > 1 && <span className="text-indigo-600"> +{rec.monitoring_needed.length - 1} more</span>}
          </p>
        </div>
      )}

      {/* Usage tracking */}
      <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg mb-4">
        <p className="text-xs text-gray-600 dark:text-gray-400">This week: <span className="font-medium">{count} taken</span></p>
      </div>

      {/* Action buttons */}
      <div className="mt-auto space-y-2">
        <div className="flex gap-2">
          <button
            onClick={async () => {
              await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recommendation_id: rec.id }) });
              mutate();
            }}
            className="flex-1 inline-block text-center py-2 text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            ✓ Taken
          </button>
          <button 
            onClick={onDetails} 
            className="flex-1 inline-block text-center py-2 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            📋 Details
          </button>
        </div>
        
        {/* Enhanced buy button */}
        <button
          onClick={handleBuyClick}
          disabled={isSearching}
          className="inline-block text-center w-full py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
        >
          {buttonInfo.text}
        </button>
        {buttonInfo.subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {buttonInfo.subtitle}
          </p>
        )}
      </div>
    </div>
  );
} 
