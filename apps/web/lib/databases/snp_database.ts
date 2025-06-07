// Comprehensive SNP Reference Database for Health Optimization & Supplement Analysis
// This database provides detailed information about genetic variants and their supplement implications

export interface SNPInfo {
  rsid: string;
  gene: string;
  pathway: string;
  description: string;
  variants: {
    [genotype: string]: {
      phenotype: string;
      frequency: string;
      supplements: string[];
      dosages: string[];
      timing: string[];
      interactions: string[];
      contraindications: string[];
      research_pmids: string[];
    }
  };
}

export const SNP_DATABASE: Record<string, SNPInfo> = {
  // METHYLATION PATHWAY ===================================================
  "rs1801133": {
    rsid: "rs1801133",
    gene: "MTHFR",
    pathway: "Methylation/Folate Metabolism",
    description: "C677T variant affects folate metabolism and homocysteine levels",
    variants: {
      "CC": {
        phenotype: "Normal MTHFR function",
        frequency: "45%",
        supplements: ["Folic acid 400mcg"],
        dosages: ["400mcg daily"],
        timing: ["With food"],
        interactions: ["None significant"],
        contraindications: ["None"],
        research_pmids: ["12595690", "15968563"]
      },
      "CT": {
        phenotype: "Reduced MTHFR activity (65-70%)",
        frequency: "45%", 
        supplements: ["L-5-MTHF (methylfolate)", "Methylcobalamin", "Riboflavin"],
        dosages: ["400-800mcg daily", "500-1000mcg daily", "100mg daily"],
        timing: ["With food", "Morning preferred", "With food"],
        interactions: ["Synergistic with B12", "Enhanced by riboflavin"],
        contraindications: ["Avoid folic acid if B12 deficient"],
        research_pmids: ["12595690", "15968563", "18053423"]
      },
      "TT": {
        phenotype: "Significantly reduced MTHFR activity (30-40%)",
        frequency: "10%",
        supplements: ["L-5-MTHF (methylfolate)", "Methylcobalamin", "Riboflavin", "TMG/Betaine"],
        dosages: ["800-1000mcg daily", "1000-2000mcg daily", "100-200mg daily", "500-1000mg daily"],
        timing: ["With food", "Morning preferred", "With food", "Between meals"],
        interactions: ["Critical B12 cofactor", "Riboflavin enhances enzyme"],
        contraindications: ["Never use folic acid", "Monitor homocysteine"],
        research_pmids: ["12595690", "15968563", "18053423", "21102327"]
      }
    }
  },

  "rs1801131": {
    rsid: "rs1801131", 
    gene: "MTHFR",
    pathway: "Methylation/BH4 Synthesis",
    description: "A1298C variant affects BH4 cofactor production",
    variants: {
      "AA": {
        phenotype: "Normal MTHFR function",
        frequency: "50%",
        supplements: ["Standard B vitamins"],
        dosages: ["RDA amounts"],
        timing: ["With food"],
        interactions: ["None significant"],
        contraindications: ["None"],
        research_pmids: ["11675996"]
      },
      "AC": {
        phenotype: "Mildly reduced MTHFR activity",
        frequency: "40%",
        supplements: ["L-5-MTHF", "BH4 precursors", "Magnesium"],
        dosages: ["400-600mcg daily", "500mg daily", "400mg daily"],
        timing: ["With food", "Morning", "Evening"],
        interactions: ["Works with C677T variants"],
        contraindications: ["Monitor with antidepressants"],
        research_pmids: ["11675996", "15968563"]
      },
      "CC": {
        phenotype: "Reduced BH4 production, neurotransmitter effects",
        frequency: "10%",
        supplements: ["L-5-MTHF", "BH4 precursors", "L-tyrosine", "5-HTP precursors"],
        dosages: ["600-800mcg daily", "500-1000mg daily", "500mg daily", "100mg daily"],
        timing: ["With food", "Morning", "Morning empty stomach", "Evening"],
        interactions: ["May affect serotonin/dopamine"],
        contraindications: ["Caution with psychiatric medications"],
        research_pmids: ["11675996", "18053423"]
      }
    }
  },

  "rs1801394": {
    rsid: "rs1801394",
    gene: "MTRR",
    pathway: "Methylation/B12 Recycling",
    description: "Methionine synthase reductase variant affecting B12 utilization",
    variants: {
      "AA": {
        phenotype: "Normal MTRR function",
        frequency: "60%",
        supplements: ["Standard B12"],
        dosages: ["250-500mcg daily"],
        timing: ["With food"],
        interactions: ["Works with folate"],
        contraindications: ["None"],
        research_pmids: ["11786058"]
      },
      "AG": {
        phenotype: "Mildly reduced B12 recycling",
        frequency: "35%",
        supplements: ["Methylcobalamin", "Adenosylcobalamin"],
        dosages: ["500-1000mcg daily", "500mcg daily"],
        timing: ["Morning", "With breakfast"],
        interactions: ["Enhanced by folate"],
        contraindications: ["Monitor B12 levels"],
        research_pmids: ["11786058", "15968563"]
      },
      "GG": {
        phenotype: "Significantly reduced B12 recycling",
        frequency: "5%",
        supplements: ["High-dose methylcobalamin", "Adenosylcobalamin", "Hydroxycobalamin"],
        dosages: ["1000-2000mcg daily", "1000mcg daily", "1000mcg weekly injection"],
        timing: ["Morning", "With breakfast", "As directed"],
        interactions: ["Critical for methylation cycle"],
        contraindications: ["Regular B12 monitoring essential"],
        research_pmids: ["11786058", "15968563"]
      }
    }
  },

  "rs1805087": {
    rsid: "rs1805087",
    gene: "MTR",
    pathway: "Methylation/Methionine Synthase",
    description: "Methionine synthase variant affecting homocysteine metabolism",
    variants: {
      "AA": {
        phenotype: "Normal methionine synthase function",
        frequency: "75%",
        supplements: ["Standard B vitamins"],
        dosages: ["RDA amounts"],
        timing: ["With food"],
        interactions: ["Works with B12/folate"],
        contraindications: ["None"],
        research_pmids: ["10677305"]
      },
      "AG": {
        phenotype: "Reduced methionine synthase activity",
        frequency: "22%",
        supplements: ["Methylcobalamin", "L-5-MTHF", "Methionine"],
        dosages: ["1000mcg daily", "400mcg daily", "500mg daily"],
        timing: ["Morning", "With food", "Between meals"],
        interactions: ["Synergistic with MTHFR support"],
        contraindications: ["Monitor homocysteine"],
        research_pmids: ["10677305", "15968563"]
      },
      "GG": {
        phenotype: "Significantly impaired methionine synthesis",
        frequency: "3%",
        supplements: ["High-dose methylcobalamin", "L-5-MTHF", "SAMe", "TMG"],
        dosages: ["2000mcg daily", "800mcg daily", "400mg daily", "1000mg daily"],
        timing: ["Morning", "With food", "Morning", "Between meals"],
        interactions: ["Critical methylation support needed"],
        contraindications: ["Regular homocysteine monitoring"],
        research_pmids: ["10677305", "15968563"]
      }
    }
  },

  // DETOXIFICATION PATHWAY ===============================================
  "rs4680": {
    rsid: "rs4680",
    gene: "COMT", 
    pathway: "Dopamine/Catecholamine Metabolism",
    description: "Val158Met variant affects dopamine clearance and stress response",
    variants: {
      "GG": {
        phenotype: "Fast COMT activity (Warrior gene)",
        frequency: "25%",
        supplements: ["L-tyrosine", "Rhodiola", "B6 (P5P)", "Magnesium"],
        dosages: ["500-1000mg daily", "300-600mg daily", "25-50mg daily", "400mg daily"],
        timing: ["Morning empty stomach", "Morning", "With food", "Evening"],
        interactions: ["Supports dopamine production"],
        contraindications: ["Avoid if hypertensive"],
        research_pmids: ["14616862", "17008817"]
      },
      "AG": {
        phenotype: "Intermediate COMT activity",
        frequency: "50%",
        supplements: ["Balanced dopamine support", "Magnesium", "B6"],
        dosages: ["Moderate doses", "400mg daily", "25mg daily"],
        timing: ["With food", "Evening", "With food"],
        interactions: ["Flexible supplementation"],
        contraindications: ["Monitor response"],
        research_pmids: ["14616862"]
      },
      "AA": {
        phenotype: "Slow COMT activity (Worrier gene)",
        frequency: "25%",
        supplements: ["Magnesium glycinate", "L-theanine", "EGCG", "SAMe (low dose)"],
        dosages: ["400-600mg daily", "200mg daily", "300mg daily", "200mg daily"],
        timing: ["Evening", "As needed", "With food", "Morning"],
        interactions: ["Avoid excess dopamine support"],
        contraindications: ["Limit stimulants", "Monitor mood"],
        research_pmids: ["14616862", "17008817", "19152508"]
      }
    }
  },

  "rs6323": {
    rsid: "rs6323",
    gene: "MAOA",
    pathway: "Neurotransmitter Metabolism",
    description: "Monoamine oxidase A variant affecting serotonin/norepinephrine breakdown",
    variants: {
      "GG": {
        phenotype: "High MAOA activity",
        frequency: "40%",
        supplements: ["5-HTP", "Tryptophan", "B6"],
        dosages: ["100-200mg daily", "500mg daily", "50mg daily"],
        timing: ["Evening", "Evening", "With food"],
        interactions: ["Supports serotonin production"],
        contraindications: ["Monitor with antidepressants"],
        research_pmids: ["15199571"]
      },
      "GT": {
        phenotype: "Intermediate MAOA activity",
        frequency: "45%",
        supplements: ["Balanced neurotransmitter support", "B-complex"],
        dosages: ["Moderate doses", "Standard"],
        timing: ["With food", "Morning"],
        interactions: ["Flexible approach"],
        contraindications: ["Monitor mood"],
        research_pmids: ["15199571"]
      },
      "TT": {
        phenotype: "Low MAOA activity (Warrior gene)",
        frequency: "15%",
        supplements: ["Green tea extract", "Curcumin", "Magnesium"],
        dosages: ["500mg daily", "500mg daily", "400mg daily"],
        timing: ["With food", "With food", "Evening"],
        interactions: ["Natural MAOA inhibition"],
        contraindications: ["Avoid excess serotonin precursors"],
        research_pmids: ["15199571", "19152508"]
      }
    }
  },

  "rs1065852": {
    rsid: "rs1065852",
    gene: "CYP2D6",
    pathway: "Drug Metabolism",
    description: "Major drug metabolizing enzyme affecting medication and supplement metabolism",
    variants: {
      "CC": {
        phenotype: "Normal CYP2D6 function",
        frequency: "60%",
        supplements: ["Standard dosing"],
        dosages: ["Normal ranges"],
        timing: ["As directed"],
        interactions: ["Normal drug interactions"],
        contraindications: ["Standard precautions"],
        research_pmids: ["12692815"]
      },
      "CT": {
        phenotype: "Reduced CYP2D6 activity",
        frequency: "30%",
        supplements: ["Lower initial doses", "Monitor response"],
        dosages: ["Start 50% lower", "Titrate carefully"],
        timing: ["As directed", "Monitor closely"],
        interactions: ["Enhanced drug sensitivity"],
        contraindications: ["Careful with codeine/tramadol"],
        research_pmids: ["12692815", "15151917"]
      },
      "TT": {
        phenotype: "Poor CYP2D6 metabolizer",
        frequency: "10%",
        supplements: ["Very low doses", "Alternative pathways"],
        dosages: ["Start 25% normal", "Consider alternatives"],
        timing: ["Extended intervals", "Monitor closely"],
        interactions: ["Severe drug accumulation risk"],
        contraindications: ["Avoid codeine, many antidepressants"],
        research_pmids: ["12692815", "15151917"]
      }
    }
  },

  "rs1799930": {
    rsid: "rs1799930",
    gene: "NAT2",
    pathway: "Phase II Detoxification",
    description: "N-acetyltransferase 2 variant affecting acetylation detoxification",
    variants: {
      "GG": {
        phenotype: "Fast acetylator",
        frequency: "40%",
        supplements: ["Standard NAC", "Glutathione precursors"],
        dosages: ["600mg daily", "500mg daily"],
        timing: ["Empty stomach", "With food"],
        interactions: ["Normal detox capacity"],
        contraindications: ["None specific"],
        research_pmids: ["11259347"]
      },
      "GA": {
        phenotype: "Intermediate acetylator",
        frequency: "45%",
        supplements: ["NAC", "Alpha-lipoic acid"],
        dosages: ["800mg daily", "300mg daily"],
        timing: ["Empty stomach", "With food"],
        interactions: ["Moderate detox support needed"],
        contraindications: ["Monitor toxin exposure"],
        research_pmids: ["11259347"]
      },
      "AA": {
        phenotype: "Slow acetylator",
        frequency: "15%",
        supplements: ["High-dose NAC", "Glutathione", "Milk thistle"],
        dosages: ["1200mg daily", "500mg daily", "300mg daily"],
        timing: ["Empty stomach", "With food", "With food"],
        interactions: ["Enhanced detox support critical"],
        contraindications: ["Limit toxin exposure", "Avoid isoniazid"],
        research_pmids: ["11259347", "12456147"]
      }
    }
  },

  "rs1695": {
    rsid: "rs1695",
    gene: "GSTP1",
    pathway: "Glutathione Conjugation",
    description: "Glutathione S-transferase P1 variant affecting detoxification capacity",
    variants: {
      "AA": {
        phenotype: "Normal GSTP1 function",
        frequency: "50%",
        supplements: ["Standard glutathione support"],
        dosages: ["Normal ranges"],
        timing: ["With food"],
        interactions: ["Good detox capacity"],
        contraindications: ["None specific"],
        research_pmids: ["10604482"]
      },
      "AG": {
        phenotype: "Reduced GSTP1 activity",
        frequency: "40%",
        supplements: ["NAC", "Glutathione", "Selenium"],
        dosages: ["800mg daily", "500mg daily", "200mcg daily"],
        timing: ["Empty stomach", "With food", "With food"],
        interactions: ["Enhanced detox support"],
        contraindications: ["Limit environmental toxins"],
        research_pmids: ["10604482", "12456147"]
      },
      "GG": {
        phenotype: "Significantly reduced GSTP1 function",
        frequency: "10%",
        supplements: ["High-dose NAC", "Liposomal glutathione", "Alpha-lipoic acid"],
        dosages: ["1200mg daily", "750mg daily", "600mg daily"],
        timing: ["Empty stomach", "With food", "With food"],
        interactions: ["Critical detox support needed"],
        contraindications: ["Minimize toxin exposure", "Regular monitoring"],
        research_pmids: ["10604482", "12456147"]
      }
    }
  },

  // CARDIOVASCULAR/LIPID METABOLISM ======================================
  "rs429358": {
    rsid: "rs429358",
    gene: "APOE",
    pathway: "Lipid Metabolism/Alzheimer's Risk", 
    description: "APOE ε4 variant affects lipid metabolism and neurodegeneration risk",
    variants: {
      "CC": {
        phenotype: "APOE ε3 (normal)",
        frequency: "60%",
        supplements: ["Standard omega-3", "Vitamin E"],
        dosages: ["1000mg daily", "400 IU daily"],
        timing: ["With food", "With food"],
        interactions: ["None significant"],
        contraindications: ["None"],
        research_pmids: ["7668250"]
      },
      "CT": {
        phenotype: "APOE ε3/ε4 (moderate risk)",
        frequency: "25%",
        supplements: ["DHA (high dose)", "Curcumin", "PQQ", "Vitamin E (mixed tocopherols)"],
        dosages: ["2000mg daily", "500mg daily", "20mg daily", "400 IU daily"],
        timing: ["With food", "With food", "Morning", "With food"],
        interactions: ["Synergistic neuroprotection"],
        contraindications: ["Monitor bleeding risk"],
        research_pmids: ["7668250", "12032546", "25681541"]
      },
      "TT": {
        phenotype: "APOE ε4/ε4 (high risk)",
        frequency: "2%",
        supplements: ["DHA (very high)", "Curcumin", "Lion's Mane", "PQQ", "Resveratrol"],
        dosages: ["3000mg daily", "1000mg daily", "1000mg daily", "20mg daily", "500mg daily"],
        timing: ["With food", "With food", "With food", "Morning", "Evening"],
        interactions: ["Comprehensive neuroprotection protocol"],
        contraindications: ["Regular cognitive monitoring"],
        research_pmids: ["7668250", "12032546", "25681541"]
      }
    }
  },

  "rs7412": {
    rsid: "rs7412",
    gene: "APOE",
    pathway: "Lipid Metabolism/Alzheimer's Protection",
    description: "APOE ε2 variant associated with longevity and Alzheimer's protection",
    variants: {
      "CC": {
        phenotype: "APOE ε3 (normal)",
        frequency: "85%",
        supplements: ["Standard cardiovascular support"],
        dosages: ["Normal ranges"],
        timing: ["With food"],
        interactions: ["Standard metabolism"],
        contraindications: ["None specific"],
        research_pmids: ["7668250"]
      },
      "CT": {
        phenotype: "APOE ε2/ε3 (protective)",
        frequency: "13%",
        supplements: ["Lower-dose fish oil", "Moderate antioxidants"],
        dosages: ["500-1000mg daily", "Standard doses"],
        timing: ["With food", "With food"],
        interactions: ["May have enhanced lipid clearance"],
        contraindications: ["Monitor triglycerides"],
        research_pmids: ["7668250", "12032546"]
      },
      "TT": {
        phenotype: "APOE ε2/ε2 (high protection, lipid issues)",
        frequency: "2%",
        supplements: ["Niacin", "Fibrates alternative", "Moderate omega-3"],
        dosages: ["500mg daily", "As directed", "1000mg daily"],
        timing: ["With food", "As directed", "With food"],
        interactions: ["May develop type III hyperlipoproteinemia"],
        contraindications: ["Regular lipid monitoring essential"],
        research_pmids: ["7668250", "10751605"]
      }
    }
  },

  "rs1333049": {
    rsid: "rs1333049",
    gene: "CDKN2A/CDKN2B",
    pathway: "Cardiovascular Disease Risk",
    description: "Chromosome 9p21 variant associated with coronary artery disease risk",
    variants: {
      "GG": {
        phenotype: "Lower cardiovascular risk",
        frequency: "25%",
        supplements: ["Standard cardiovascular support"],
        dosages: ["Normal ranges"],
        timing: ["With food"],
        interactions: ["Standard risk profile"],
        contraindications: ["None specific"],
        research_pmids: ["17478681"]
      },
      "CG": {
        phenotype: "Moderate cardiovascular risk increase",
        frequency: "50%",
        supplements: ["Enhanced omega-3", "CoQ10", "Magnesium"],
        dosages: ["2000mg daily", "200mg daily", "400mg daily"],
        timing: ["With food", "With food", "Evening"],
        interactions: ["Preventive cardiovascular support"],
        contraindications: ["Monitor cardiovascular markers"],
        research_pmids: ["17478681", "18397984"]
      },
      "CC": {
        phenotype: "High cardiovascular risk (60% increase)",
        frequency: "25%",
        supplements: ["High-dose omega-3", "CoQ10", "Magnesium", "Hawthorn"],
        dosages: ["3000mg daily", "300mg daily", "600mg daily", "500mg daily"],
        timing: ["With food", "With food", "Evening", "With food"],
        interactions: ["Aggressive cardiovascular protection"],
        contraindications: ["Regular cardiac monitoring", "Lifestyle optimization critical"],
        research_pmids: ["17478681", "18397984"]
      }
    }
  },

  // VITAMIN D PATHWAY ================================================
  "rs2228570": {
    rsid: "rs2228570",
    gene: "VDR",
    pathway: "Vitamin D Receptor Function",
    description: "FokI variant affects vitamin D receptor efficiency",
    variants: {
      "CC": {
        phenotype: "Efficient VDR function",
        frequency: "40%",
        supplements: ["Vitamin D3", "Magnesium", "K2"],
        dosages: ["2000-3000 IU daily", "400mg daily", "100mcg daily"],
        timing: ["With fat", "Evening", "With D3"],
        interactions: ["Standard vitamin D metabolism"],
        contraindications: ["Monitor 25(OH)D levels"],
        research_pmids: ["10946176"]
      },
      "CT": {
        phenotype: "Moderately reduced VDR efficiency",
        frequency: "45%",
        supplements: ["Vitamin D3 (higher dose)", "Magnesium", "K2", "Calcium"],
        dosages: ["3000-4000 IU daily", "400mg daily", "120mcg daily", "500mg daily"],
        timing: ["With fat", "Evening", "With D3", "With food"],
        interactions: ["Requires cofactor optimization"],
        contraindications: ["Regular monitoring needed"],
        research_pmids: ["10946176", "12856918"]
      },
      "TT": {
        phenotype: "Significantly reduced VDR efficiency", 
        frequency: "15%",
        supplements: ["Vitamin D3 (high dose)", "Magnesium", "K2", "Boron", "Zinc"],
        dosages: ["4000-5000 IU daily", "600mg daily", "150mcg daily", "10mg daily", "15mg daily"],
        timing: ["With fat", "Evening", "With D3", "With food", "With food"],
        interactions: ["Comprehensive VDR support needed"],
        contraindications: ["Frequent monitoring essential"],
        research_pmids: ["10946176", "12856918", "15579539"]
      }
    }
  },

  "rs7975232": {
    rsid: "rs7975232",
    gene: "VDR",
    pathway: "Vitamin D Receptor Function",
    description: "ApaI variant affecting vitamin D receptor sensitivity",
    variants: {
      "GG": {
        phenotype: "Higher VDR sensitivity",
        frequency: "30%",
        supplements: ["Standard vitamin D3"],
        dosages: ["2000 IU daily"],
        timing: ["With fat"],
        interactions: ["Good vitamin D response"],
        contraindications: ["Monitor for excess"],
        research_pmids: ["10946176"]
      },
      "GT": {
        phenotype: "Intermediate VDR sensitivity",
        frequency: "50%",
        supplements: ["Vitamin D3", "Magnesium"],
        dosages: ["3000 IU daily", "400mg daily"],
        timing: ["With fat", "Evening"],
        interactions: ["Moderate vitamin D response"],
        contraindications: ["Regular monitoring"],
        research_pmids: ["10946176", "12856918"]
      },
      "TT": {
        phenotype: "Lower VDR sensitivity",
        frequency: "20%",
        supplements: ["High-dose vitamin D3", "Magnesium", "K2"],
        dosages: ["4000-5000 IU daily", "500mg daily", "120mcg daily"],
        timing: ["With fat", "Evening", "With D3"],
        interactions: ["May need higher doses"],
        contraindications: ["Frequent monitoring required"],
        research_pmids: ["10946176", "12856918"]
      }
    }
  },

  "rs4588": {
    rsid: "rs4588",
    gene: "GC",
    pathway: "Vitamin D Binding Protein",
    description: "Vitamin D binding protein variant affecting vitamin D transport",
    variants: {
      "CC": {
        phenotype: "High vitamin D binding capacity",
        frequency: "35%",
        supplements: ["Higher-dose vitamin D3"],
        dosages: ["4000-5000 IU daily"],
        timing: ["With fat"],
        interactions: ["More D3 bound to proteins"],
        contraindications: ["Monitor free 25(OH)D"],
        research_pmids: ["18398441"]
      },
      "CA": {
        phenotype: "Intermediate binding capacity",
        frequency: "45%",
        supplements: ["Vitamin D3", "Magnesium"],
        dosages: ["3000 IU daily", "400mg daily"],
        timing: ["With fat", "Evening"],
        interactions: ["Moderate binding"],
        contraindications: ["Standard monitoring"],
        research_pmids: ["18398441"]
      },
      "AA": {
        phenotype: "Lower binding capacity",
        frequency: "20%",
        supplements: ["Standard vitamin D3"],
        dosages: ["2000-3000 IU daily"],
        timing: ["With fat"],
        interactions: ["More free vitamin D available"],
        contraindications: ["Monitor for excess"],
        research_pmids: ["18398441"]
      }
    }
  },

  // IRON METABOLISM ===================================================
  "rs1800562": {
    rsid: "rs1800562",
    gene: "HFE",
    pathway: "Iron Metabolism",
    description: "C282Y variant affects iron absorption and storage",
    variants: {
      "GG": {
        phenotype: "Normal iron metabolism",
        frequency: "85%",
        supplements: ["Iron (if deficient)", "Vitamin C"],
        dosages: ["18-25mg daily", "500mg daily"],
        timing: ["Empty stomach", "With iron"],
        interactions: ["Standard iron absorption"],
        contraindications: ["Monitor iron status"],
        research_pmids: ["8673102"]
      },
      "GA": {
        phenotype: "Carrier - mild iron accumulation risk",
        frequency: "12%",
        supplements: ["Avoid iron unless deficient", "Quercetin", "Green tea"],
        dosages: ["Monitor closely", "500mg daily", "2-3 cups daily"],
        timing: ["N/A", "Between meals", "Between meals"],
        interactions: ["Iron chelation support"],
        contraindications: ["Regular iron monitoring"],
        research_pmids: ["8673102", "12456147"]
      },
      "AA": {
        phenotype: "Hemochromatosis risk - excess iron absorption",
        frequency: "3%",
        supplements: ["NO iron supplements", "Quercetin", "Milk thistle", "Curcumin"],
        dosages: ["Strictly avoid", "500mg twice daily", "300mg daily", "500mg daily"],
        timing: ["N/A", "Between meals", "With food", "With food"],
        interactions: ["Iron chelation protocol"],
        contraindications: ["Never supplement iron", "Regular phlebotomy may be needed"],
        research_pmids: ["8673102", "12456147"]
      }
    }
  },

  "rs1799945": {
    rsid: "rs1799945",
    gene: "HFE",
    pathway: "Iron Metabolism",
    description: "H63D variant associated with mild iron overload",
    variants: {
      "CC": {
        phenotype: "Normal iron regulation",
        frequency: "75%",
        supplements: ["Standard iron support"],
        dosages: ["Normal ranges"],
        timing: ["With vitamin C"],
        interactions: ["Normal iron absorption"],
        contraindications: ["None specific"],
        research_pmids: ["8673102"]
      },
      "CG": {
        phenotype: "Mild iron accumulation tendency",
        frequency: "22%",
        supplements: ["Avoid excess iron", "Monitor levels"],
        dosages: ["Lower doses", "Regular testing"],
        timing: ["With food", "N/A"],
        interactions: ["Slightly increased absorption"],
        contraindications: ["Monitor iron status"],
        research_pmids: ["8673102", "12456147"]
      },
      "GG": {
        phenotype: "Moderate iron accumulation risk",
        frequency: "3%",
        supplements: ["Avoid iron supplements", "Quercetin", "Green tea"],
        dosages: ["Unless deficient", "500mg daily", "2-3 cups daily"],
        timing: ["Monitor closely", "Between meals", "Between meals"],
        interactions: ["Iron chelation beneficial"],
        contraindications: ["Regular iron monitoring", "Limit iron-rich foods"],
        research_pmids: ["8673102", "12456147"]
      }
    }
  },

  "rs855791": {
    rsid: "rs855791",
    gene: "TMPRSS6",
    pathway: "Iron Regulation",
    description: "Transmembrane protease serine 6 variant affecting hepcidin regulation",
    variants: {
      "CC": {
        phenotype: "Normal iron regulation",
        frequency: "40%",
        supplements: ["Standard iron support"],
        dosages: ["Normal ranges"],
        timing: ["With vitamin C"],
        interactions: ["Normal hepcidin function"],
        contraindications: ["None specific"],
        research_pmids: ["17999355"]
      },
      "CT": {
        phenotype: "Slightly higher iron levels",
        frequency: "45%",
        supplements: ["Monitor iron status", "Vitamin C"],
        dosages: ["Lower iron doses", "500mg daily"],
        timing: ["With food", "With iron"],
        interactions: ["Reduced hepcidin"],
        contraindications: ["Regular iron monitoring"],
        research_pmids: ["17999355"]
      },
      "TT": {
        phenotype: "Higher iron absorption efficiency",
        frequency: "15%",
        supplements: ["Avoid excess iron", "Quercetin"],
        dosages: ["Unless clearly deficient", "500mg daily"],
        timing: ["Monitor closely", "Between meals"],
        interactions: ["Significantly reduced hepcidin"],
        contraindications: ["Frequent iron monitoring", "Iron overload risk"],
        research_pmids: ["17999355", "12456147"]
      }
    }
  },

  // CAFFEINE METABOLISM ===============================================
  "rs762551": {
    rsid: "rs762551",
    gene: "CYP1A2",
    pathway: "Caffeine/Drug Metabolism",
    description: "Affects caffeine metabolism speed and cardiovascular response",
    variants: {
      "AA": {
        phenotype: "Slow caffeine metabolizer",
        frequency: "45%",
        supplements: ["Limit caffeine", "L-theanine", "Magnesium", "Taurine"],
        dosages: ["<100mg daily", "200mg daily", "400mg daily", "1000mg daily"],
        timing: ["Morning only", "With caffeine", "Evening", "Evening"],
        interactions: ["Enhanced caffeine sensitivity"],
        contraindications: ["Avoid evening caffeine", "Monitor heart rate"],
        research_pmids: ["16522833", "17234515"]
      },
      "AC": {
        phenotype: "Intermediate caffeine metabolism",
        frequency: "40%",
        supplements: ["Moderate caffeine", "L-theanine", "B vitamins"],
        dosages: ["100-200mg daily", "100mg daily", "B-complex"],
        timing: ["Morning/early afternoon", "With caffeine", "Morning"],
        interactions: ["Balanced caffeine response"],
        contraindications: ["Monitor individual response"],
        research_pmids: ["16522833"]
      },
      "CC": {
        phenotype: "Fast caffeine metabolizer",
        frequency: "15%",
        supplements: ["Caffeine tolerance higher", "B vitamins", "Adrenal support"],
        dosages: ["200-400mg daily", "B-complex", "Adaptogenic herbs"],
        timing: ["Throughout day", "Morning", "As needed"],
        interactions: ["May need higher stimulant doses"],
        contraindications: ["Avoid dependence"],
        research_pmids: ["16522833", "17234515"]
      }
    }
  },

  "rs2472297": {
    rsid: "rs2472297",
    gene: "CYP1A2",
    pathway: "Caffeine Metabolism",
    description: "Additional CYP1A2 variant affecting caffeine clearance",
    variants: {
      "TT": {
        phenotype: "Normal caffeine metabolism",
        frequency: "50%",
        supplements: ["Standard caffeine tolerance"],
        dosages: ["Normal ranges"],
        timing: ["Standard timing"],
        interactions: ["Normal caffeine response"],
        contraindications: ["None specific"],
        research_pmids: ["16522833"]
      },
      "CT": {
        phenotype: "Slightly reduced metabolism",
        frequency: "40%",
        supplements: ["Moderate caffeine", "L-theanine"],
        dosages: ["150mg daily", "100mg daily"],
        timing: ["Morning preferred", "With caffeine"],
        interactions: ["Mild sensitivity increase"],
        contraindications: ["Monitor response"],
        research_pmids: ["16522833"]
      },
      "CC": {
        phenotype: "Reduced caffeine metabolism",
        frequency: "10%",
        supplements: ["Lower caffeine", "L-theanine", "Magnesium"],
        dosages: ["<150mg daily", "200mg daily", "400mg daily"],
        timing: ["Morning only", "With caffeine", "Evening"],
        interactions: ["Enhanced caffeine sensitivity"],
        contraindications: ["Limit afternoon caffeine"],
        research_pmids: ["16522833", "17234515"]
      }
    }
  },

  // INFLAMMATION PATHWAY ==============================================
  "rs1800795": {
    rsid: "rs1800795",
    gene: "IL6",
    pathway: "Inflammatory Response",
    description: "Interleukin-6 promoter variant affecting inflammation levels",
    variants: {
      "GG": {
        phenotype: "Lower IL-6 production",
        frequency: "30%",
        supplements: ["Standard anti-inflammatory support"],
        dosages: ["Normal ranges"],
        timing: ["With food"],
        interactions: ["Lower baseline inflammation"],
        contraindications: ["None specific"],
        research_pmids: ["10888873"]
      },
      "GC": {
        phenotype: "Intermediate IL-6 production",
        frequency: "50%",
        supplements: ["Omega-3", "Curcumin"],
        dosages: ["2000mg daily", "500mg daily"],
        timing: ["With food", "With food"],
        interactions: ["Moderate inflammatory response"],
        contraindications: ["Monitor inflammatory markers"],
        research_pmids: ["10888873", "18397984"]
      },
      "CC": {
        phenotype: "Higher IL-6 production (pro-inflammatory)",
        frequency: "20%",
        supplements: ["High-dose omega-3", "Curcumin", "Quercetin", "Green tea"],
        dosages: ["3000mg daily", "1000mg daily", "500mg daily", "3-4 cups daily"],
        timing: ["With food", "With food", "Between meals", "Throughout day"],
        interactions: ["Aggressive anti-inflammatory support"],
        contraindications: ["Regular inflammatory marker monitoring"],
        research_pmids: ["10888873", "18397984"]
      }
    }
  },

  "rs1801282": {
    rsid: "rs1801282",
    gene: "PPARG",
    pathway: "Metabolic/Inflammatory Regulation",
    description: "PPAR-gamma variant affecting insulin sensitivity and inflammation",
    variants: {
      "CC": {
        phenotype: "Normal PPAR-gamma function",
        frequency: "85%",
        supplements: ["Standard metabolic support"],
        dosages: ["Normal ranges"],
        timing: ["With food"],
        interactions: ["Normal insulin sensitivity"],
        contraindications: ["None specific"],
        research_pmids: ["9771707"]
      },
      "CG": {
        phenotype: "Enhanced insulin sensitivity",
        frequency: "14%",
        supplements: ["Omega-3", "Alpha-lipoic acid"],
        dosages: ["2000mg daily", "300mg daily"],
        timing: ["With food", "With food"],
        interactions: ["Better glucose tolerance"],
        contraindications: ["Monitor blood sugar"],
        research_pmids: ["9771707", "18397984"]
      },
      "GG": {
        phenotype: "Significantly enhanced insulin sensitivity",
        frequency: "1%",
        supplements: ["Moderate omega-3", "Chromium"],
        dosages: ["1000mg daily", "200mcg daily"],
        timing: ["With food", "With meals"],
        interactions: ["Very good glucose metabolism"],
        contraindications: ["Monitor for hypoglycemia"],
        research_pmids: ["9771707", "18397984"]
      }
    }
  }
};

// Function to get SNP information
export function getSNPInfo(rsid: string): SNPInfo | null {
  return SNP_DATABASE[rsid] || null;
}

// Function to get supplement recommendations for a specific genotype
export function getSNPSupplementRecommendations(rsid: string, genotype: string): string[] {
  const snpInfo = getSNPInfo(rsid);
  if (!snpInfo || !snpInfo.variants[genotype]) {
    return [];
  }
  return snpInfo.variants[genotype].supplements;
}

// Function to get all relevant SNPs for a pathway
export function getSNPsByPathway(pathway: string): SNPInfo[] {
  return Object.values(SNP_DATABASE).filter(snp => 
    snp.pathway.toLowerCase().includes(pathway.toLowerCase())
  );
} 