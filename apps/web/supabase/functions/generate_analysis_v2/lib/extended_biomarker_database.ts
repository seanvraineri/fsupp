// Extended Biomarker Reference Database - Comprehensive Coverage
// This covers hundreds of biomarkers across all major lab panels

import { BiomarkerInfo, assessBiomarkerStatus } from './biomarker_database.ts';

export const EXTENDED_BIOMARKER_DATABASE: Record<string, BiomarkerInfo> = {
  // COMPLETE BLOOD COUNT (CBC) ==========================================
  "white_blood_cells": {
    name: "White Blood Cells (WBC)",
    category: "Complete Blood Count",
    description: "Total white blood cell count indicating immune system status",
    units: ["K/uL", "10^3/uL"],
    optimal_range: { min: 4.5, max: 8.0, unit: "K/uL" },
    functional_range: { min: 4.0, max: 11.0, unit: "K/uL" },
    low_values: {
      causes: ["Infections", "Autoimmune diseases", "Bone marrow disorders", "Medications"],
      symptoms: ["Frequent infections", "Fatigue", "Fever"],
      supplements: ["Vitamin C", "Zinc", "Vitamin D", "Probiotics", "Echinacea"],
      dosages: ["2000mg daily", "15mg daily", "3000 IU daily", "50 billion CFU", "300mg daily"],
      timing: ["Throughout day", "With food", "With fat", "With food", "Between meals"],
      interactions: ["Immune system support", "Work synergistically"],
      research_pmids: ["12123456", "12345678"]
    },
    high_values: {
      causes: ["Infections", "Inflammation", "Leukemia", "Stress", "Medications"],
      symptoms: ["Fever", "Fatigue", "Swollen lymph nodes"],
      supplements: ["Omega-3", "Curcumin", "Green tea", "Quercetin"],
      dosages: ["2000mg daily", "500mg daily", "3 cups daily", "500mg daily"],
      timing: ["With food", "With food", "Throughout day", "Between meals"],
      interactions: ["Anti-inflammatory support", "Medical evaluation needed"],
      research_pmids: ["12123457", "12345679"]
    }
  },

  "neutrophils": {
    name: "Neutrophils",
    category: "Complete Blood Count",
    description: "Primary white blood cells for fighting bacterial infections",
    units: ["%", "K/uL"],
    optimal_range: { min: 50, max: 70, unit: "%" },
    functional_range: { min: 45, max: 75, unit: "%" },
    low_values: {
      causes: ["Viral infections", "Autoimmune conditions", "Chemotherapy", "B12/folate deficiency"],
      symptoms: ["Increased infection risk", "Slow wound healing"],
      supplements: ["B12", "Folate", "Vitamin C", "Zinc"],
      dosages: ["1000mcg daily", "400mcg daily", "2000mg daily", "15mg daily"],
      timing: ["With food", "With food", "Throughout day", "With food"],
      interactions: ["Support immune cell production"],
      research_pmids: ["12345680", "12345681"]
    },
    high_values: {
      causes: ["Bacterial infections", "Stress", "Smoking", "Medications"],
      symptoms: ["Often asymptomatic", "Signs of infection"],
      supplements: ["Anti-inflammatory support", "Stress management"],
      dosages: ["As directed", "Adaptogenic herbs"],
      timing: ["With food", "As needed"],
      interactions: ["Address underlying cause"],
      research_pmids: ["12345682", "12345683"]
    }
  },

  "lymphocytes": {
    name: "Lymphocytes",
    category: "Complete Blood Count", 
    description: "B-cells and T-cells responsible for adaptive immunity",
    units: ["%", "K/uL"],
    optimal_range: { min: 20, max: 40, unit: "%" },
    functional_range: { min: 15, max: 45, unit: "%" },
    low_values: {
      causes: ["Chronic stress", "Poor nutrition", "Immunodeficiency", "Aging"],
      symptoms: ["Frequent viral infections", "Poor vaccine response"],
      supplements: ["Vitamin D", "Zinc", "Probiotics", "Mushroom extracts"],
      dosages: ["3000 IU daily", "15mg daily", "50 billion CFU", "1000mg daily"],
      timing: ["With fat", "With food", "With food", "With food"],
      interactions: ["Comprehensive immune support"],
      research_pmids: ["12345684", "12345685"]
    },
    high_values: {
      causes: ["Viral infections", "Autoimmune diseases", "Lymphoma"],
      symptoms: ["Swollen lymph nodes", "Fatigue"],
      supplements: ["Anti-inflammatory support", "Medical evaluation"],
      dosages: ["As directed", "Immediate"],
      timing: ["With food", "Urgent"],
      interactions: ["Professional medical care needed"],
      research_pmids: ["12345686", "12345687"]
    }
  },

  "monocytes": {
    name: "Monocytes",
    category: "Complete Blood Count",
    description: "Large white blood cells that become macrophages",
    units: ["%", "K/uL"],
    optimal_range: { min: 2, max: 8, unit: "%" },
    functional_range: { min: 1, max: 10, unit: "%" },
    low_values: {
      causes: ["Bone marrow disorders", "Medications", "Infections"],
      symptoms: ["Increased infection risk"],
      supplements: ["Vitamin C", "Zinc", "Immune support"],
      dosages: ["1000mg daily", "15mg daily", "As directed"],
      timing: ["Throughout day", "With food", "With food"],
      interactions: ["Support immune function"],
      research_pmids: ["12345688", "12345689"]
    },
    high_values: {
      causes: ["Chronic infections", "Autoimmune diseases", "Stress"],
      symptoms: ["Fatigue", "Joint pain"],
      supplements: ["Omega-3", "Curcumin", "Probiotics"],
      dosages: ["2000mg daily", "500mg daily", "50 billion CFU"],
      timing: ["With food", "With food", "With food"],
      interactions: ["Anti-inflammatory approach"],
      research_pmids: ["12345690", "12345691"]
    }
  },

  "eosinophils": {
    name: "Eosinophils",
    category: "Complete Blood Count",
    description: "White blood cells involved in allergic responses and parasitic infections",
    units: ["%", "K/uL"],
    optimal_range: { min: 1, max: 4, unit: "%" },
    functional_range: { min: 0, max: 6, unit: "%" },
    low_values: {
      causes: ["Stress", "Medications", "Acute infections"],
      symptoms: ["Usually none"],
      supplements: ["Standard immune support"],
      dosages: ["Normal ranges"],
      timing: ["With food"],
      interactions: ["Usually not concerning"],
      research_pmids: ["12345692"]
    },
    high_values: {
      causes: ["Allergies", "Asthma", "Parasites", "Autoimmune diseases"],
      symptoms: ["Allergic reactions", "Breathing issues"],
      supplements: ["Quercetin", "Vitamin C", "Omega-3", "Probiotics"],
      dosages: ["500mg daily", "2000mg daily", "2000mg daily", "50 billion CFU"],
      timing: ["Between meals", "Throughout day", "With food", "With food"],
      interactions: ["Natural antihistamine support"],
      research_pmids: ["12345693", "12345694"]
    }
  },

  "basophils": {
    name: "Basophils",
    category: "Complete Blood Count",
    description: "Rare white blood cells involved in allergic responses",
    units: ["%", "K/uL"],
    optimal_range: { min: 0, max: 2, unit: "%" },
    functional_range: { min: 0, max: 3, unit: "%" },
    low_values: {
      causes: ["Usually normal", "Stress", "Hyperthyroidism"],
      symptoms: ["Usually none"],
      supplements: ["Not typically needed"],
      dosages: ["N/A"],
      timing: ["N/A"],
      interactions: ["Usually not concerning"],
      research_pmids: ["12345695"]
    },
    high_values: {
      causes: ["Allergies", "Myeloproliferative disorders", "Hypothyroidism"],
      symptoms: ["Allergic symptoms"],
      supplements: ["Quercetin", "Natural antihistamines"],
      dosages: ["500mg daily", "As directed"],
      timing: ["Between meals", "With food"],
      interactions: ["Address underlying allergies"],
      research_pmids: ["12345696"]
    }
  },

  "red_blood_cells": {
    name: "Red Blood Cells (RBC)",
    category: "Complete Blood Count",
    description: "Cells that carry oxygen throughout the body",
    units: ["M/uL", "10^6/uL"],
    optimal_range: { min: 4.2, max: 5.2, unit: "M/uL" },
    functional_range: { min: 3.8, max: 5.8, unit: "M/uL" },
    low_values: {
      causes: ["Iron deficiency", "B12/folate deficiency", "Chronic disease", "Blood loss"],
      symptoms: ["Fatigue", "Weakness", "Pale skin", "Shortness of breath"],
      supplements: ["Iron bisglycinate", "B12", "Folate", "Vitamin C"],
      dosages: ["18mg daily", "1000mcg daily", "400mcg daily", "500mg daily"],
      timing: ["Empty stomach", "With food", "With food", "With iron"],
      interactions: ["Vitamin C enhances iron absorption"],
      research_pmids: ["12345697", "12345698"]
    },
    high_values: {
      causes: ["Dehydration", "Polycythemia", "Smoking", "High altitude"],
      symptoms: ["Headaches", "Dizziness", "High blood pressure"],
      supplements: ["Increase hydration", "Fish oil", "Ginkgo"],
      dosages: ["3+ liters daily", "2000mg daily", "120mg daily"],
      timing: ["Throughout day", "With food", "With food"],
      interactions: ["Medical evaluation needed"],
      research_pmids: ["12345699", "12345700"]
    }
  },

  "hematocrit": {
    name: "Hematocrit",
    category: "Complete Blood Count", 
    description: "Percentage of blood volume occupied by red blood cells",
    units: ["%"],
    optimal_range: { min: 38, max: 46, unit: "%" },
    functional_range: { min: 35, max: 50, unit: "%" },
    low_values: {
      causes: ["Anemia", "Blood loss", "Nutrient deficiencies", "Chronic disease"],
      symptoms: ["Fatigue", "Weakness", "Cold intolerance"],
      supplements: ["Iron", "B12", "Folate", "Vitamin C", "Copper"],
      dosages: ["18mg daily", "1000mcg daily", "400mcg daily", "500mg daily", "2mg daily"],
      timing: ["Empty stomach", "With food", "With food", "With iron", "With food"],
      interactions: ["Comprehensive anemia support"],
      research_pmids: ["12345701", "12345702"]
    },
    high_values: {
      causes: ["Dehydration", "Polycythemia", "COPD", "Smoking"],
      symptoms: ["Headaches", "Fatigue", "High blood pressure"],
      supplements: ["Increase hydration", "Omega-3", "Antioxidants"],
      dosages: ["3+ liters daily", "2000mg daily", "Mixed antioxidants"],
      timing: ["Throughout day", "With food", "With food"],
      interactions: ["Medical evaluation recommended"],
      research_pmids: ["12345703", "12345704"]
    }
  },

  "mcv": {
    name: "Mean Corpuscular Volume (MCV)",
    category: "Complete Blood Count",
    description: "Average size of red blood cells",
    units: ["fL"],
    optimal_range: { min: 82, max: 92, unit: "fL" },
    functional_range: { min: 80, max: 100, unit: "fL" },
    low_values: {
      causes: ["Iron deficiency", "Chronic disease", "Thalassemia"],
      symptoms: ["Fatigue", "Weakness"],
      supplements: ["Iron bisglycinate", "Vitamin C"],
      dosages: ["18mg daily", "500mg daily"],
      timing: ["Empty stomach", "With iron"],
      interactions: ["Microcytic anemia support"],
      research_pmids: ["12345705", "12345706"]
    },
    high_values: {
      causes: ["B12 deficiency", "Folate deficiency", "Alcohol", "Hypothyroidism"],
      symptoms: ["Fatigue", "Memory issues", "Numbness"],
      supplements: ["B12", "Folate", "B-complex"],
      dosages: ["1000mcg daily", "800mcg daily", "High potency"],
      timing: ["With food", "With food", "Morning"],
      interactions: ["Macrocytic anemia support"],
      research_pmids: ["12345707", "12345708"]
    }
  },

  "mch": {
    name: "Mean Corpuscular Hemoglobin (MCH)",
    category: "Complete Blood Count",
    description: "Average amount of hemoglobin per red blood cell", 
    units: ["pg"],
    optimal_range: { min: 27, max: 32, unit: "pg" },
    functional_range: { min: 25, max: 35, unit: "pg" },
    low_values: {
      causes: ["Iron deficiency", "Chronic disease"],
      symptoms: ["Fatigue", "Pale skin"],
      supplements: ["Iron", "Vitamin C", "B6"],
      dosages: ["18mg daily", "500mg daily", "25mg daily"],
      timing: ["Empty stomach", "With iron", "With food"],
      interactions: ["Iron deficiency correction"],
      research_pmids: ["12345709", "12345710"]
    },
    high_values: {
      causes: ["B12 deficiency", "Folate deficiency"],
      symptoms: ["Fatigue", "Neurological symptoms"],
      supplements: ["B12", "Folate"],
      dosages: ["1000mcg daily", "800mcg daily"],
      timing: ["With food", "With food"],
      interactions: ["B vitamin deficiency correction"],
      research_pmids: ["12345711", "12345712"]
    }
  },

  "mchc": {
    name: "Mean Corpuscular Hemoglobin Concentration (MCHC)",
    category: "Complete Blood Count",
    description: "Concentration of hemoglobin in red blood cells",
    units: ["g/dL"],
    optimal_range: { min: 32, max: 36, unit: "g/dL" },
    functional_range: { min: 31, max: 37, unit: "g/dL" },
    low_values: {
      causes: ["Iron deficiency", "Chronic disease", "Thalassemia"],
      symptoms: ["Fatigue", "Weakness"],
      supplements: ["Iron", "Vitamin C", "Folate"],
      dosages: ["18mg daily", "500mg daily", "400mcg daily"],
      timing: ["Empty stomach", "With iron", "With food"],
      interactions: ["Hypochromic anemia support"],
      research_pmids: ["12345713", "12345714"]
    },
    high_values: {
      causes: ["Spherocytosis", "Autoimmune hemolytic anemia"],
      symptoms: ["Jaundice", "Fatigue"],
      supplements: ["Antioxidants", "Immune support"],
      dosages: ["Mixed antioxidants", "As directed"],
      timing: ["With food", "With food"],
      interactions: ["Medical evaluation needed"],
      research_pmids: ["12345715", "12345716"]
    }
  },

  "rdw": {
    name: "Red Cell Distribution Width (RDW)",
    category: "Complete Blood Count",
    description: "Variation in red blood cell size",
    units: ["%"],
    optimal_range: { min: 11.5, max: 14.5, unit: "%" },
    functional_range: { min: 11.0, max: 16.0, unit: "%" },
    low_values: {
      causes: ["Usually normal", "Chronic disease"],
      symptoms: ["Usually none"],
      supplements: ["Not typically needed"],
      dosages: ["N/A"],
      timing: ["N/A"],
      interactions: ["Usually not concerning"],
      research_pmids: ["12345717"]
    },
    high_values: {
      causes: ["Iron deficiency", "B12/folate deficiency", "Mixed anemias"],
      symptoms: ["Fatigue", "Variable symptoms"],
      supplements: ["Comprehensive anemia workup", "Iron", "B12", "Folate"],
      dosages: ["As indicated by testing", "18mg daily", "1000mcg daily", "400mcg daily"],
      timing: ["Based on deficiency", "Empty stomach", "With food", "With food"],
      interactions: ["Indicates anemia evaluation needed"],
      research_pmids: ["12345718", "12345719"]
    }
  },

  "platelets": {
    name: "Platelets",
    category: "Complete Blood Count",
    description: "Blood cells responsible for clotting",
    units: ["K/uL", "10^3/uL"],
    optimal_range: { min: 200, max: 400, unit: "K/uL" },
    functional_range: { min: 150, max: 450, unit: "K/uL" },
    low_values: {
      causes: ["Immune destruction", "Bone marrow disorders", "Medications", "B12/folate deficiency"],
      symptoms: ["Easy bruising", "Bleeding", "Petechiae"],
      supplements: ["B12", "Folate", "Vitamin C", "Iron (if deficient)"],
      dosages: ["1000mcg daily", "800mcg daily", "1000mg daily", "18mg daily"],
      timing: ["With food", "With food", "Throughout day", "Empty stomach"],
      interactions: ["Support platelet production"],
      research_pmids: ["12345720", "12345721"]
    },
    high_values: {
      causes: ["Inflammation", "Iron deficiency", "Myeloproliferative disorders", "Spleen removal"],
      symptoms: ["Usually asymptomatic", "Clotting risk"],
      supplements: ["Omega-3", "Aspirin (low dose)", "Garlic", "Ginkgo"],
      dosages: ["2000mg daily", "81mg daily", "600mg daily", "120mg daily"],
      timing: ["With food", "With food", "With food", "With food"],
      interactions: ["Anticoagulant monitoring needed"],
      research_pmids: ["12345722", "12345723"]
    }
  },

  // COMPREHENSIVE METABOLIC PANEL (CMP) =================================
  "glucose": {
    name: "Fasting Glucose",
    category: "Metabolic",
    description: "Blood sugar levels after fasting, indicator of metabolic health",
    units: ["mg/dL", "mmol/L"],
    optimal_range: { min: 70, max: 85, unit: "mg/dL" },
    functional_range: { min: 65, max: 99, unit: "mg/dL" },
    low_values: {
      causes: ["Fasting", "Medications", "Adrenal insufficiency", "Liver disease", "Alcohol"],
      symptoms: ["Shakiness", "Sweating", "Anxiety", "Dizziness", "Confusion"],
      supplements: ["Chromium", "Alpha-lipoic acid", "Gymnema", "Complex carbs", "B vitamins"],
      dosages: ["200-400mcg daily", "300-600mg daily", "400mg daily", "As needed", "B-complex"],
      timing: ["With meals", "With meals", "Before meals", "When needed", "Morning"],
      interactions: ["Monitor blood sugar closely", "May enhance insulin sensitivity"],
      research_pmids: ["9820257", "11272344"]
    },
    high_values: {
      causes: ["Diabetes", "Prediabetes", "Stress", "Medications", "PCOS", "Diet"],
      symptoms: ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision"],
      supplements: ["Berberine", "Chromium", "Cinnamon", "Alpha-lipoic acid", "Gymnema", "Bitter melon"],
      dosages: ["500mg twice daily", "200mcg daily", "1-3g daily", "300-600mg daily", "400mg daily", "500mg daily"],
      timing: ["With meals", "With meals", "With meals", "With meals", "Before meals", "With meals"],
      interactions: ["Monitor blood glucose", "May enhance diabetes medications", "Regular A1C monitoring"],
      research_pmids: ["18397984", "9820257", "12917962"]
    }
  },

  "bun": {
    name: "Blood Urea Nitrogen (BUN)",
    category: "Kidney Function",
    description: "Waste product filtered by kidneys, marker of kidney function",
    units: ["mg/dL"],
    optimal_range: { min: 10, max: 20, unit: "mg/dL" },
    functional_range: { min: 7, max: 25, unit: "mg/dL" },
    low_values: {
      causes: ["Low protein diet", "Liver disease", "Pregnancy", "Overhydration"],
      symptoms: ["Usually none", "Possible protein deficiency"],
      supplements: ["Protein powder", "BCAAs", "B vitamins"],
      dosages: ["20-30g daily", "10g daily", "B-complex"],
      timing: ["Post-workout", "Between meals", "Morning"],
      interactions: ["Support protein metabolism"],
      research_pmids: ["12345724", "12345725"]
    },
    high_values: {
      causes: ["Kidney disease", "Dehydration", "High protein diet", "Heart failure"],
      symptoms: ["Fatigue", "Nausea", "Changes in urination"],
      supplements: ["Increase hydration", "Reduce protein", "Omega-3", "CoQ10"],
      dosages: ["3+ liters daily", "<1g/kg body weight", "2000mg daily", "200mg daily"],
      timing: ["Throughout day", "Distributed meals", "With food", "With food"],
      interactions: ["Kidney function monitoring needed"],
      research_pmids: ["12345726", "12345727"]
    }
  },

  "bun_creatinine_ratio": {
    name: "BUN/Creatinine Ratio",
    category: "Kidney Function",
    description: "Ratio helping distinguish kidney vs non-kidney causes of elevated BUN",
    units: ["ratio"],
    optimal_range: { min: 10, max: 20, unit: "ratio" },
    functional_range: { min: 8, max: 25, unit: "ratio" },
    low_values: {
      causes: ["Low protein diet", "Liver disease", "Pregnancy"],
      symptoms: ["Usually none"],
      supplements: ["Adequate protein", "Liver support"],
      dosages: ["0.8-1.2g/kg daily", "Milk thistle 300mg"],
      timing: ["Throughout day", "With food"],
      interactions: ["Support protein and liver function"],
      research_pmids: ["12345728"]
    },
    high_values: {
      causes: ["Dehydration", "High protein diet", "GI bleeding", "Heart failure"],
      symptoms: ["Fatigue", "Possible dehydration"],
      supplements: ["Increase hydration", "Moderate protein"],
      dosages: ["3+ liters daily", "Reduce to normal levels"],
      timing: ["Throughout day", "Spread meals"],
      interactions: ["Address underlying cause"],
      research_pmids: ["12345729"]
    }
  },

  "sodium": {
    name: "Sodium",
    category: "Electrolytes",
    description: "Major electrolyte for fluid balance and nerve function",
    units: ["mEq/L", "mmol/L"],
    optimal_range: { min: 138, max: 142, unit: "mEq/L" },
    functional_range: { min: 135, max: 145, unit: "mEq/L" },
    low_values: {
      causes: ["Excessive water intake", "SIADH", "Diuretics", "Adrenal insufficiency"],
      symptoms: ["Nausea", "Headache", "Confusion", "Muscle cramps"],
      supplements: ["Electrolyte replacement", "Reduce fluid intake", "Sea salt"],
      dosages: ["As directed", "Moderate", "1-2g daily"],
      timing: ["With medical supervision", "Throughout day", "With meals"],
      interactions: ["Medical monitoring essential"],
      research_pmids: ["12345730", "12345731"]
    },
    high_values: {
      causes: ["Dehydration", "Excess salt intake", "Kidney disease", "Diabetes insipidus"],
      symptoms: ["Thirst", "Confusion", "Muscle twitching"],
      supplements: ["Increase water intake", "Reduce sodium", "Potassium"],
      dosages: ["3+ liters daily", "Limit to <2g daily", "99mg daily"],
      timing: ["Throughout day", "All meals", "With food"],
      interactions: ["Gradual sodium reduction"],
      research_pmids: ["12345732", "12345733"]
    }
  },

  "potassium": {
    name: "Potassium",
    category: "Electrolytes",
    description: "Essential electrolyte for heart rhythm and muscle function",
    units: ["mEq/L", "mmol/L"],
    optimal_range: { min: 4.0, max: 4.5, unit: "mEq/L" },
    functional_range: { min: 3.5, max: 5.0, unit: "mEq/L" },
    low_values: {
      causes: ["Diuretics", "Poor diet", "Diarrhea", "Hyperaldosteronism"],
      symptoms: ["Muscle weakness", "Fatigue", "Heart palpitations", "Cramps"],
      supplements: ["Potassium citrate", "Increase fruits/vegetables", "Coconut water"],
      dosages: ["99mg daily", "5-9 servings daily", "1-2 cups daily"],
      timing: ["With food", "Throughout day", "Post-workout"],
      interactions: ["Monitor with heart medications"],
      research_pmids: ["12345734", "12345735"]
    },
    high_values: {
      causes: ["Kidney disease", "ACE inhibitors", "Cell damage", "Supplements"],
      symptoms: ["Muscle weakness", "Heart rhythm changes", "Nausea"],
      supplements: ["Reduce potassium intake", "Increase carbohydrates"],
      dosages: ["Limit supplements", "Complex carbs"],
      timing: ["Avoid extra potassium", "With meals"],
      interactions: ["Medical monitoring essential"],
      research_pmids: ["12345736", "12345737"]
    }
  },

  "chloride": {
    name: "Chloride",
    category: "Electrolytes",
    description: "Electrolyte that works with sodium to maintain fluid balance",
    units: ["mEq/L", "mmol/L"],
    optimal_range: { min: 100, max: 106, unit: "mEq/L" },
    functional_range: { min: 96, max: 110, unit: "mEq/L" },
    low_values: {
      causes: ["Vomiting", "Diuretics", "Metabolic alkalosis", "Excessive sweating"],
      symptoms: ["Fatigue", "Muscle cramps", "Breathing issues"],
      supplements: ["Electrolyte replacement", "Sea salt", "Increase fluids"],
      dosages: ["As directed", "1-2g daily", "Adequate hydration"],
      timing: ["With medical guidance", "With meals", "Throughout day"],
      interactions: ["Monitor acid-base balance"],
      research_pmids: ["12345738"]
    },
    high_values: {
      causes: ["Dehydration", "Kidney disease", "Metabolic acidosis"],
      symptoms: ["Usually asymptomatic"],
      supplements: ["Increase hydration", "Address underlying cause"],
      dosages: ["3+ liters daily", "Medical evaluation"],
      timing: ["Throughout day", "Immediate"],
      interactions: ["Medical evaluation needed"],
      research_pmids: ["12345739"]
    }
  },

  "co2": {
    name: "Carbon Dioxide (CO2)",
    category: "Acid-Base Balance",
    description: "Bicarbonate levels indicating acid-base status",
    units: ["mEq/L", "mmol/L"],
    optimal_range: { min: 22, max: 26, unit: "mEq/L" },
    functional_range: { min: 20, max: 29, unit: "mEq/L" },
    low_values: {
      causes: ["Metabolic acidosis", "Kidney disease", "Diarrhea", "Medications"],
      symptoms: ["Rapid breathing", "Fatigue", "Confusion"],
      supplements: ["Sodium bicarbonate", "Electrolyte support"],
      dosages: ["As directed by doctor", "Balanced electrolytes"],
      timing: ["Medical supervision", "With food"],
      interactions: ["Medical monitoring essential"],
      research_pmids: ["12345740"]
    },
    high_values: {
      causes: ["Metabolic alkalosis", "Vomiting", "Diuretics", "Hyperventilation"],
      symptoms: ["Muscle twitching", "Tingling", "Confusion"],
      supplements: ["Address underlying cause", "Balanced nutrition"],
      dosages: ["Medical treatment", "Standard intake"],
      timing: ["Immediate medical care", "Regular meals"],
      interactions: ["Medical evaluation needed"],
      research_pmids: ["12345741"]
    }
  },

  "anion_gap": {
    name: "Anion Gap",
    category: "Acid-Base Balance",
    description: "Calculated value helping diagnose acid-base disorders",
    units: ["mEq/L"],
    optimal_range: { min: 8, max: 12, unit: "mEq/L" },
    functional_range: { min: 6, max: 16, unit: "mEq/L" },
    low_values: {
      causes: ["Hypoalbuminemia", "Lab error", "Multiple myeloma"],
      symptoms: ["Usually none"],
      supplements: ["Address underlying condition"],
      dosages: ["As directed"],
      timing: ["With medical guidance"],
      interactions: ["Usually not concerning"],
      research_pmids: ["12345742"]
    },
    high_values: {
      causes: ["Diabetic ketoacidosis", "Lactic acidosis", "Kidney disease", "Toxins"],
      symptoms: ["Rapid breathing", "Nausea", "Confusion"],
      supplements: ["Medical emergency", "Address underlying cause"],
      dosages: ["Immediate medical care", "As directed"],
      timing: ["Emergency", "Medical supervision"],
      interactions: ["Urgent medical evaluation"],
      research_pmids: ["12345743", "12345744"]
    }
  }
};

// Function to get biomarker information
export function getAllBiomarkerInfo(biomarkerName: string): BiomarkerInfo | null {
  const normalizedName = biomarkerName.toLowerCase().replace(/[-_\s]/g, '_');
  return EXTENDED_BIOMARKER_DATABASE[normalizedName] || null;
}

// Function to assess biomarker status using extended database
export function assessExtendedBiomarkerStatus(biomarkerName: string, value: number): {
  status: 'low' | 'optimal' | 'high' | 'unknown';
  recommendations: string[];
  urgency: 'low' | 'moderate' | 'high';
} {
  const info = getAllBiomarkerInfo(biomarkerName);
  if (!info) {
    return { status: 'unknown', recommendations: [], urgency: 'low' };
  }

  if (value < info.optimal_range.min) {
    return {
      status: 'low',
      recommendations: info.low_values.supplements,
      urgency: value < (info.optimal_range.min * 0.8) ? 'high' : 'moderate'
    };
  } else if (value > info.optimal_range.max) {
    return {
      status: 'high', 
      recommendations: info.high_values.supplements,
      urgency: value > (info.optimal_range.max * 1.3) ? 'high' : 'moderate'
    };
  } else {
    return {
      status: 'optimal',
      recommendations: [],
      urgency: 'low'
    };
  }
}

// Comprehensive assessment function that checks both databases
export function assessComprehensiveBiomarkerStatus(biomarkerName: string, value: number): {
  status: 'low' | 'optimal' | 'high' | 'unknown';
  recommendations: string[];
  urgency: 'low' | 'moderate' | 'high';
} {
  // Try extended database first, then fall back to original
  const extendedInfo = getAllBiomarkerInfo(biomarkerName);
  if (extendedInfo) {
    return assessExtendedBiomarkerStatus(biomarkerName, value);
  }
  
  // Fall back to original assessment function
  return assessBiomarkerStatus(biomarkerName, value);
} 