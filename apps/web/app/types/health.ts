export interface HealthAssessmentData {
  demographics: {
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;
    height: {
      value: number;
      unit: 'cm' | 'inches';
    } | null;
    weight: {
      value: number;
      unit: 'kg' | 'lbs';
    } | null;
  };
  lifestyle: {
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null;
    sleepDuration: number | null;
  };
  medical: {
    currentMedications: string[];
    healthConditions: string[];
    allergies: string[];
  };
  dietary: {
    dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'other' | null;
    restrictions: string[];
    healthGoals: string[];
  };
  uploads: {
    geneticData: {
      fileName: string;
      fileType: string;
      uploadDate: string;
    } | null;
    labResults: {
      fileName:string;
      fileType: string;
      uploadDate: string;
    } | null;
  };
  metadata: {
    assessmentDate: string;
    assessmentVersion: string;
    completionTime: number;
  };
  extra: {
    currentSupplements: string[];
  };
} 