export interface GeneReference {
  gene: string;
  rsids: string[]; // rs identifiers involved
  genotypesOfConcern?: string[]; // e.g. ["CT", "TT"]
  impact: string; // short description of functional impact
  supplement: string; // main nutrient or intervention
  dosage: string; // dosage guideline
  evidence: 'high' | 'moderate' | 'low';
  cautions?: string;
}

export const geneReferences: GeneReference[] = [
  {
    gene: 'MTHFR',
    rsids: ['rs1801133', 'rs1801131'], // C677T, A1298C
    genotypesOfConcern: ['CT', 'TT', 'AC', 'CC'],
    impact: 'Reduced conversion of folate to 5-MTHF leading to elevated homocysteine',
    supplement: 'L-Methylfolate',
    dosage: '400–1000 µg daily',
    evidence: 'high',
    cautions: 'Avoid >800 µg folic acid as it can mask B-12 deficiency',
  },
  {
    gene: 'MTR / MTRR',
    rsids: ['rs1805087', 'rs1801394'],
    impact: 'Impaired remethylation of homocysteine → fatigue, high homocysteine',
    supplement: 'Methyl-B12; Betaine (TMG)',
    dosage: '1-5 mg B-12 sub-lingual, 500–1000 mg TMG',
    evidence: 'moderate',
    cautions: 'PPIs reduce B-12 absorption',
  },
  {
    gene: 'APOE',
    rsids: ['rs429358', 'rs7412'],
    genotypesOfConcern: ['ε3/ε4', 'ε4/ε4'],
    impact: "Higher LDL-C & increased Alzheimer's risk",
    supplement: 'DHA-rich fish oil; Mediterranean diet',
    dosage: 'EPA+DHA ≥ 1 g daily',
    evidence: 'high',
    cautions: 'High saturated-fat diet worsens lipids in ε4 carriers',
  },
  {
    gene: 'VDR',
    rsids: ['rs2228570', 'rs1544410'], // FokI, BsmI
    impact: 'Reduced vitamin-D receptor activity',
    supplement: 'Vitamin D3 + K2',
    dosage: '2000–5000 IU D3 daily',
    evidence: 'moderate',
    cautions: 'Glucocorticoids can further reduce receptor activity',
  },
  // ... add the rest as needed ...
]; 
