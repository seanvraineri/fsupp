// Comprehensive Biomarker Reference Database for Health Optimization & Supplement Analysis
// This database provides detailed information about lab biomarkers and their supplement interventions

export interface BiomarkerInfo {
  name: string;
  category: string;
  description: string;
  units: string[];
  optimal_range: {
    min: number;
    max: number;
    unit: string;
  };
  functional_range: {
    min: number;
    max: number;
    unit: string;
  };
  low_values: {
    causes: string[];
    symptoms: string[];
    supplements: string[];
    dosages: string[];
    timing: string[];
    interactions: string[];
    research_pmids: string[];
  };
  high_values: {
    causes: string[];
    symptoms: string[];
    supplements: string[];
    dosages: string[];
    timing: string[];
    interactions: string[];
    research_pmids: string[];
  };
}

export const BIOMARKER_DATABASE: Record<string, BiomarkerInfo> = {
  // HORMONES =============================================================
  "testosterone_total": {
    name: "Testosterone Total",
    category: "Hormones",
    description: "Primary male sex hormone affecting muscle, bone, libido, and energy",
    units: ["ng/dL", "nmol/L"],
    optimal_range: { min: 500, max: 900, unit: "ng/dL" },
    functional_range: { min: 400, max: 1000, unit: "ng/dL" },
    low_values: {
      causes: ["Aging", "Stress", "Poor sleep", "Obesity", "Alcohol", "Medications"],
      symptoms: ["Low libido", "Fatigue", "Muscle loss", "Depression", "Brain fog"],
      supplements: ["D-Aspartic Acid", "Zinc", "Magnesium", "Vitamin D3", "Ashwagandha", "DHEA"],
      dosages: ["3000mg daily", "15-30mg daily", "400mg daily", "3000-5000 IU daily", "600mg daily", "25-50mg daily"],
      timing: ["Morning empty stomach", "With food", "Evening", "With fat", "With food", "Morning"],
      interactions: ["Synergistic with zinc/magnesium", "Vitamin D essential", "Monitor with medications"],
      research_pmids: ["23843619", "21154195", "20352370", "21154195"]
    },
    high_values: {
      causes: ["Genetics", "Supplements", "Anabolic steroids", "PCOS (women)", "Tumors"],
      symptoms: ["Acne", "Hair loss", "Aggression", "Sleep apnea", "Prostate issues"],
      supplements: ["Saw Palmetto", "Green Tea Extract", "Spearmint", "DIM", "Nettle Root"],
      dosages: ["320mg daily", "500mg daily", "2 cups daily", "200mg daily", "300mg daily"],
      timing: ["With food", "With food", "Between meals", "With food", "With food"],
      interactions: ["5-alpha reductase inhibitors", "Monitor PSA levels"],
      research_pmids: ["10861778", "11881987", "15650394"]
    }
  },

  "vitamin_d": {
    name: "Vitamin D 25-OH",
    category: "Vitamins",
    description: "Critical hormone affecting immune function, bone health, and cellular processes",
    units: ["ng/mL", "nmol/L"],
    optimal_range: { min: 40, max: 80, unit: "ng/mL" },
    functional_range: { min: 30, max: 100, unit: "ng/mL" },
    low_values: {
      causes: ["Limited sun exposure", "Dark skin", "Malabsorption", "Kidney disease", "Diet"],
      symptoms: ["Fatigue", "Depression", "Bone pain", "Frequent infections", "Muscle weakness"],
      supplements: ["Vitamin D3", "Magnesium", "Vitamin K2", "Boron", "Zinc"],
      dosages: ["2000-5000 IU daily", "400mg daily", "100-200mcg daily", "10mg daily", "15mg daily"],
      timing: ["With fat/largest meal", "Evening", "With D3", "With food", "With food"],
      interactions: ["Magnesium required for conversion", "K2 prevents calcium buildup", "Monitor with genetics"],
      research_pmids: ["18400738", "19237723", "17972266"]
    },
    high_values: {
      causes: ["Excess supplementation", "Sarcoidosis", "Hyperparathyroidism", "Granulomatous disease"],
      symptoms: ["Hypercalcemia", "Kidney stones", "Nausea", "Weakness", "Confusion"],
      supplements: ["Discontinue D3", "Magnesium", "Increase hydration", "Monitor calcium"],
      dosages: ["Stop immediately", "400-600mg daily", "3+ liters daily", "Regular testing"],
      timing: ["N/A", "Evening", "Throughout day", "Weekly monitoring"],
      interactions: ["Avoid calcium supplements", "Monitor kidney function"],
      research_pmids: ["18400738", "16778085"]
    }
  },

  "cholesterol_total": {
    name: "Total Cholesterol",
    category: "Lipids",
    description: "Combined LDL, HDL, and VLDL cholesterol levels",
    units: ["mg/dL", "mmol/L"],
    optimal_range: { min: 150, max: 200, unit: "mg/dL" },
    functional_range: { min: 140, max: 220, unit: "mg/dL" },
    low_values: {
      causes: ["Malnutrition", "Hyperthyroidism", "Liver disease", "Statins", "Genetics"],
      symptoms: ["Fatigue", "Depression", "Hormone deficiency", "Poor wound healing"],
      supplements: ["Coenzyme Q10", "Cholesterol precursors", "B vitamins", "Healthy fats"],
      dosages: ["100-200mg daily", "As directed", "B-complex", "2-3g daily"],
      timing: ["With food", "With food", "Morning", "With meals"],
      interactions: ["Monitor statin interaction", "Support hormone production"],
      research_pmids: ["15351198", "10751605"]
    },
    high_values: {
      causes: ["Diet", "Genetics", "Hypothyroidism", "Diabetes", "Sedentary lifestyle"],
      symptoms: ["Often asymptomatic", "Cardiovascular risk", "Xanthomas", "Corneal arcus"],
      supplements: ["Red Yeast Rice", "Berberine", "Plant Sterols", "Psyllium", "Niacin"],
      dosages: ["1200mg daily", "500mg twice daily", "2g daily", "10-15g daily", "500-2000mg daily"],
      timing: ["Evening", "With meals", "With meals", "With water", "With food"],
      interactions: ["Monitor liver enzymes", "May interact with statins", "Flushing with niacin"],
      research_pmids: ["10642298", "18397984", "15147930"]
    }
  },

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

  "tsh": {
    name: "Thyroid Stimulating Hormone",
    category: "Hormones",
    description: "Pituitary hormone that regulates thyroid function",
    units: ["mIU/L", "μIU/mL"],
    optimal_range: { min: 1.0, max: 2.5, unit: "mIU/L" },
    functional_range: { min: 0.5, max: 4.5, unit: "mIU/L" },
    low_values: {
      causes: ["Hyperthyroidism", "Pituitary dysfunction", "Medications", "Pregnancy"],
      symptoms: ["Weight loss", "Rapid heartbeat", "Anxiety", "Sweating", "Insomnia"],
      supplements: ["L-carnitine", "Bugleweed", "Lemon balm", "Magnesium", "B vitamins"],
      dosages: ["2-3g daily", "300mg daily", "500mg daily", "400mg daily", "B-complex"],
      timing: ["With meals", "With food", "With food", "Evening", "Morning"],
      interactions: ["Monitor thyroid medications", "Regular monitoring needed"],
      research_pmids: ["12169365", "10584049"]
    },
    high_values: {
      causes: ["Hypothyroidism", "Hashimoto's", "Iodine deficiency", "Stress", "Medications"],
      symptoms: ["Weight gain", "Fatigue", "Cold intolerance", "Constipation", "Depression"],
      supplements: ["Iodine (if deficient)", "Selenium", "Tyrosine", "Ashwagandha", "Zinc"],
      dosages: ["150-300mcg daily", "200mcg daily", "500-1000mg daily", "600mg daily", "15mg daily"],
      timing: ["Morning empty stomach", "With food", "Morning empty stomach", "With food", "With food"],
      interactions: ["Monitor thyroid medications", "Selenium critical for conversion", "Regular monitoring"],
      research_pmids: ["12351752", "10584049", "12169365"]
    }
  },

  "ferritin": {
    name: "Ferritin",
    category: "Iron Studies",
    description: "Iron storage protein, indicator of iron status and inflammation",
    units: ["ng/mL", "μg/L"],
    optimal_range: { min: 50, max: 150, unit: "ng/mL" },
    functional_range: { min: 30, max: 300, unit: "ng/mL" },
    low_values: {
      causes: ["Iron deficiency", "Blood loss", "Poor absorption", "Vegetarian diet", "SIBO"],
      symptoms: ["Fatigue", "Weakness", "Pale skin", "Restless legs", "Hair loss"],
      supplements: ["Iron bisglycinate", "Vitamin C", "Lactoferrin", "B12", "Folate"],
      dosages: ["18-25mg daily", "500mg daily", "200mg daily", "1000mcg daily", "400mcg daily"],
      timing: ["Empty stomach", "With iron", "With food", "With food", "With food"],
      interactions: ["Vitamin C enhances absorption", "Avoid with tea/coffee", "Monitor hemoglobin"],
      research_pmids: ["14733909", "12859709"]
    },
    high_values: {
      causes: ["Hemochromatosis", "Inflammation", "Liver disease", "Alcohol", "Transfusions"],
      symptoms: ["Joint pain", "Fatigue", "Skin darkening", "Liver problems", "Diabetes"],
      supplements: ["Quercetin", "Green tea", "Milk thistle", "Alpha-lipoic acid", "Avoid iron"],
      dosages: ["500mg twice daily", "3-4 cups daily", "300mg daily", "300mg daily", "Zero"],
      timing: ["Between meals", "Between meals", "With food", "With food", "N/A"],
      interactions: ["Iron chelation support", "Monitor liver function", "Regular phlebotomy may be needed"],
      research_pmids: ["12456147", "10583134"]
    }
  },

  "creatinine": {
    name: "Creatinine",
    category: "Kidney Function",
    description: "Waste product from muscle metabolism, kidney function marker",
    units: ["mg/dL", "μmol/L"],
    optimal_range: { min: 0.7, max: 1.2, unit: "mg/dL" },
    functional_range: { min: 0.6, max: 1.4, unit: "mg/dL" },
    low_values: {
      causes: ["Low muscle mass", "Malnutrition", "Pregnancy", "Aging", "Liver disease"],
      symptoms: ["Muscle weakness", "Low energy", "Poor exercise tolerance"],
      supplements: ["Creatine monohydrate", "Protein powder", "BCAAs", "HMB", "Resistance training"],
      dosages: ["3-5g daily", "20-30g daily", "10-15g daily", "3g daily", "3x/week"],
      timing: ["Post-workout", "Throughout day", "Around workouts", "With meals", "Consistent schedule"],
      interactions: ["Increases muscle mass", "Monitor kidney function"],
      research_pmids: ["12945830", "10449017"]
    },
    high_values: {
      causes: ["Kidney disease", "Dehydration", "High protein diet", "Medications", "Muscle damage"],
      symptoms: ["Swelling", "Fatigue", "Nausea", "Changes in urination"],
      supplements: ["Reduce protein", "Increase hydration", "Omega-3", "Coenzyme Q10", "NAC"],
      dosages: ["<1g/kg body weight", "3+ liters daily", "2-3g daily", "100-200mg daily", "600mg daily"],
      timing: ["Throughout day", "Throughout day", "With meals", "With food", "Empty stomach"],
      interactions: ["Monitor kidney function", "May need medical intervention", "Avoid nephrotoxic supplements"],
      research_pmids: ["15461136", "12423712"]
    }
  },

  "hemoglobin": {
    name: "Hemoglobin",
    category: "Complete Blood Count",
    description: "Oxygen-carrying protein in red blood cells",
    units: ["g/dL", "g/L"],
    optimal_range: { min: 13.5, max: 16.5, unit: "g/dL" },
    functional_range: { min: 12.0, max: 18.0, unit: "g/dL" },
    low_values: {
      causes: ["Iron deficiency", "B12 deficiency", "Folate deficiency", "Chronic disease", "Blood loss"],
      symptoms: ["Fatigue", "Weakness", "Shortness of breath", "Pale skin", "Cold hands/feet"],
      supplements: ["Iron bisglycinate", "B12", "Folate", "Vitamin C", "Copper"],
      dosages: ["18-25mg daily", "1000mcg daily", "400-800mcg daily", "500mg daily", "2mg daily"],
      timing: ["Empty stomach", "With food", "With food", "With iron", "With food"],
      interactions: ["Vitamin C enhances iron", "B12/folate work together", "Monitor complete panel"],
      research_pmids: ["14733909", "11157171"]
    },
    high_values: {
      causes: ["Polycythemia", "Dehydration", "Smoking", "High altitude", "Sleep apnea"],
      symptoms: ["Headaches", "Dizziness", "High blood pressure", "Red face", "Fatigue"],
      supplements: ["Increase hydration", "Ginkgo biloba", "Fish oil", "Aspirin (low dose)", "Garlic"],
      dosages: ["3+ liters daily", "120mg daily", "2-3g daily", "81mg daily", "600mg daily"],
      timing: ["Throughout day", "With food", "With meals", "With food", "With food"],
      interactions: ["Monitor blood viscosity", "May need medical intervention", "Bleeding risk with anticoagulants"],
      research_pmids: ["15461136", "10408043"]
    }
  }
};

// Function to get biomarker information
export function getBiomarkerInfo(biomarkerName: string): BiomarkerInfo | null {
  const normalizedName = biomarkerName.toLowerCase().replace(/[-_\s]/g, '_');
  return BIOMARKER_DATABASE[normalizedName] || null;
}

// Function to assess biomarker status
export function assessBiomarkerStatus(biomarkerName: string, value: number): {
  status: 'low' | 'optimal' | 'high' | 'unknown';
  recommendations: string[];
  urgency: 'low' | 'moderate' | 'high';
} {
  const info = getBiomarkerInfo(biomarkerName);
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

// Function to get biomarkers by category
export function getBiomarkersByCategory(category: string): BiomarkerInfo[] {
  return Object.values(BIOMARKER_DATABASE).filter(biomarker =>
    biomarker.category.toLowerCase() === category.toLowerCase()
  );
} 