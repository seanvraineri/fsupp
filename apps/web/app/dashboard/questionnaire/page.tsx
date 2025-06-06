"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../components/DashboardShell';
import { ChevronRight, ChevronLeft, Check, Upload, FileText, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TestCard from '../../components/TestCard';

// AI-friendly structured data format
interface HealthAssessmentData {
  // Demographics
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
  
  // Lifestyle factors
  lifestyle: {
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | null;
    sleepDuration: number | null; // hours per night
  };
  
  // Medical information
  medical: {
    currentMedications: string[]; // Array of medication names
    healthConditions: string[]; // Array of conditions
    allergies: string[]; // Array of allergies
  };
  
  // Dietary information
  dietary: {
    dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'other' | null;
    restrictions: string[]; // Array of restrictions
    healthGoals: string[]; // Array of goals
  };
  
  // File uploads
  uploads: {
    geneticData: {
      fileName: string;
      fileType: string;
      uploadDate: string;
    } | null;
    labResults: {
      fileName: string;
      fileType: string;
      uploadDate: string;
    } | null;
  };
  
  // Metadata
  metadata: {
    assessmentDate: string;
    assessmentVersion: string;
    completionTime: number; // minutes
  };

  // Extra information
  extra: {
    currentSupplements: string[]; // Array of supplement names
  };
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;
  
  // Temporary form state for UI
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    heightFeet: '',
    heightInches: '',
    heightCm: '',
    heightUnit: 'imperial' as 'imperial' | 'metric',
    weight: '',
    activityLevel: '',
    sleepHours: '',
    medications: '',
    conditions: '',
    allergies: '',
    dietType: '',
    restrictions: '',
    goals: '',
    currentSupplements: '',
    geneticFile: null as File | null,
    labFile: null as File | null,
  });

  // Initialize Supabase client (client-side)
  const supabase = createClientComponentClient();

  const updateFormData = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    // Validation for step 1
    if (currentStep === 1) {
      if (!formData.age || !formData.gender) {
        alert('Please fill in all required fields (Age and Gender) before continuing.');
        return;
      }
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Parse height based on unit system
  const parseHeight = () => {
    if (formData.heightUnit === 'imperial') {
      const feet = parseInt(formData.heightFeet) || 0;
      const inches = parseInt(formData.heightInches) || 0;
      const totalInches = feet * 12 + inches;
      return totalInches > 0 ? { value: totalInches, unit: 'inches' as const } : null;
    } else {
      const cm = parseInt(formData.heightCm);
      return cm > 0 ? { value: cm, unit: 'cm' as const } : null;
    }
  };

  // Parse height and weight with units
  const parseHeightWeight = (value: string, type: 'height' | 'weight') => {
    if (!value) return null;
    
    if (type === 'height') {
      // This is now handled by parseHeight()
      return parseHeight();
    } else {
      // Weight parsing
      const kgMatch = value.match(/(\d+\.?\d*)\s*kg/i);
      if (kgMatch) {
        return { value: parseFloat(kgMatch[1]), unit: 'kg' };
      }
      
      const lbsMatch = value.match(/(\d+\.?\d*)\s*(lbs?|pounds?)?/i);
      if (lbsMatch) {
        return { value: parseFloat(lbsMatch[1]), unit: 'lbs' };
      }
      
      // Default to lbs if just a number
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return { value: num, unit: 'lbs' };
      }
    }
    
    return null;
  };

  // Convert form data to AI-friendly format
  const prepareDataForAI = (): HealthAssessmentData => {
    const completionTime = Math.round((Date.now() - startTime) / 60000); // in minutes
    
    return {
      demographics: {
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender as 'male' | 'female' | 'other' | null,
        height: parseHeight(),
        weight: parseHeightWeight(formData.weight, 'weight') as any,
      },
      lifestyle: {
        activityLevel: formData.activityLevel.toLowerCase().replace(' ', '_') as any,
        sleepDuration: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
      },
      medical: {
        currentMedications: formData.medications
          .split(/[,\n]/)
          .map(m => m.trim())
          .filter(m => m && m.toLowerCase() !== 'none'),
        healthConditions: formData.conditions
          .split(/[,\n]/)
          .map(c => c.trim())
          .filter(c => c && c.toLowerCase() !== 'none'),
        allergies: formData.allergies
          .split(/[,\n]/)
          .map(a => a.trim())
          .filter(a => a && a.toLowerCase() !== 'none'),
      },
      dietary: {
        dietType: formData.dietType.toLowerCase() as any,
        restrictions: formData.restrictions
          .split(/[,\n]/)
          .map(r => r.trim())
          .filter(r => r && r.toLowerCase() !== 'none'),
        healthGoals: formData.goals
          .split(/[,\n]/)
          .map(g => g.trim())
          .filter(g => g),
      },
      uploads: {
        geneticData: formData.geneticFile ? {
          fileName: formData.geneticFile.name,
          fileType: formData.geneticFile.type,
          uploadDate: new Date().toISOString(),
        } : null,
        labResults: formData.labFile ? {
          fileName: formData.labFile.name,
          fileType: formData.labFile.type,
          uploadDate: new Date().toISOString(),
        } : null,
      },
      metadata: {
        assessmentDate: new Date().toISOString(),
        assessmentVersion: '1.0',
        completionTime,
      },
      extra: {
        currentSupplements: formData.currentSupplements
          .split(/[,\n]/)
          .map(s => s.trim())
          .filter(Boolean),
      },
    };
  };

  const handleSubmit = async () => {
    const aiFormattedData = prepareDataForAI();
    
    // Validate required fields
    if (!aiFormattedData.demographics.age || !aiFormattedData.demographics.gender) {
      alert('Please fill in all required demographic information (Age and Gender).');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1) Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error('User not found');
      }

      // 2) Check if user already has a completed assessment
      const { data: existingAssessment } = await supabase
        .from('health_assessments')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_complete', true)
        .maybeSingle();

      let assessmentInsert;
      const isUpdate = !!existingAssessment;

      if (existingAssessment) {
        // Update existing assessment
        const assessmentPayload = {
          age: aiFormattedData.demographics.age,
          gender: aiFormattedData.demographics.gender,
          height_value: aiFormattedData.demographics.height?.value ?? null,
          height_unit: aiFormattedData.demographics.height?.unit ?? null,
          weight_value: aiFormattedData.demographics.weight?.value ?? null,
          weight_unit: aiFormattedData.demographics.weight?.unit ?? null,
          activity_level: aiFormattedData.lifestyle.activityLevel,
          sleep_duration: aiFormattedData.lifestyle.sleepDuration,
          current_medications: aiFormattedData.medical.currentMedications.length ? aiFormattedData.medical.currentMedications : null,
          health_conditions: aiFormattedData.medical.healthConditions.length ? aiFormattedData.medical.healthConditions : null,
          allergies: aiFormattedData.medical.allergies.length ? aiFormattedData.medical.allergies : null,
          diet_type: aiFormattedData.dietary.dietType,
          dietary_restrictions: aiFormattedData.dietary.restrictions.length ? aiFormattedData.dietary.restrictions : null,
          health_goals: aiFormattedData.dietary.healthGoals.length ? aiFormattedData.dietary.healthGoals : null,
          assessment_version: aiFormattedData.metadata.assessmentVersion,
          completion_time: aiFormattedData.metadata.completionTime,
          updated_at: new Date().toISOString(),
        };

        const { data: updateResult, error: updateError } = await supabase
          .from('health_assessments')
          .update(assessmentPayload)
          .eq('id', existingAssessment.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        assessmentInsert = updateResult;
      } else {
        // Create new assessment
        const assessmentPayload = {
          user_id: user.id,
          age: aiFormattedData.demographics.age,
          gender: aiFormattedData.demographics.gender,
          height_value: aiFormattedData.demographics.height?.value ?? null,
          height_unit: aiFormattedData.demographics.height?.unit ?? null,
          weight_value: aiFormattedData.demographics.weight?.value ?? null,
          weight_unit: aiFormattedData.demographics.weight?.unit ?? null,
          activity_level: aiFormattedData.lifestyle.activityLevel,
          sleep_duration: aiFormattedData.lifestyle.sleepDuration,
          current_medications: aiFormattedData.medical.currentMedications.length ? aiFormattedData.medical.currentMedications : null,
          health_conditions: aiFormattedData.medical.healthConditions.length ? aiFormattedData.medical.healthConditions : null,
          allergies: aiFormattedData.medical.allergies.length ? aiFormattedData.medical.allergies : null,
          diet_type: aiFormattedData.dietary.dietType,
          dietary_restrictions: aiFormattedData.dietary.restrictions.length ? aiFormattedData.dietary.restrictions : null,
          health_goals: aiFormattedData.dietary.healthGoals.length ? aiFormattedData.dietary.healthGoals : null,
          assessment_version: aiFormattedData.metadata.assessmentVersion,
          completion_time: aiFormattedData.metadata.completionTime,
          is_complete: true,
        } as const;

        const { data: insertResult, error: insertError } = await supabase
          .from('health_assessments')
          .insert(assessmentPayload)
          .select()
          .single();
        
        if (insertError) throw insertError;
        assessmentInsert = insertResult;
      }

      // Helper to handle file upload & DB insert
      const uploadFile = async (
        file: File,
        type: 'genetic' | 'lab_results',
      ) => {
        const filePath = `${user.id}/${assessmentInsert.id}/${type}/${Date.now()}_${file.name}`;
        const { error: storageError } = await supabase.storage.from('uploads').upload(filePath, file, {
          upsert: false,
        });
        if (storageError) throw storageError;

        const { error: dbError } = await supabase.from('uploaded_files').insert({
          user_id: user.id,
          assessment_id: assessmentInsert.id,
          file_type: type,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          processing_status: 'pending',
        });
        if (dbError) throw dbError;
      };

      // 3) Upload genetic file if provided
      if (formData.geneticFile) {
        await uploadFile(formData.geneticFile, 'genetic');
      }

      // 4) Upload lab results file if provided
      if (formData.labFile) {
        await uploadFile(formData.labFile, 'lab_results');
      }

      // Success message
      const message = isUpdate 
        ? 'Health assessment updated successfully!' 
        : 'Health assessment completed successfully!';
      alert(message);

      // All good -> navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error completing assessment:', err);
      alert((err as Error).message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (field: 'geneticFile' | 'labFile', file: File | null) => {
    updateFormData(field, file);
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Assessment</h1>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-from to-primary-to h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map((option) => (
                      <button
                        key={option}
                        onClick={() => updateFormData('gender', option.toLowerCase())}
                        className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                          formData.gender === option.toLowerCase()
                            ? 'border-primary-from bg-primary-from/10 text-primary-from'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-from/50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Height
                  </label>
                  
                  {/* Unit Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => updateFormData('heightUnit', 'imperial')}
                      className={`px-4 py-1 rounded-lg text-sm transition-all ${
                        formData.heightUnit === 'imperial'
                          ? 'bg-primary-from text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Feet/Inches
                    </button>
                    <button
                      onClick={() => updateFormData('heightUnit', 'metric')}
                      className={`px-4 py-1 rounded-lg text-sm transition-all ${
                        formData.heightUnit === 'metric'
                          ? 'bg-primary-from text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Centimeters
                    </button>
                  </div>
                  
                  {/* Height Input Fields */}
                  {formData.heightUnit === 'imperial' ? (
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.heightFeet}
                          onChange={(e) => updateFormData('heightFeet', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Feet"
                          min="0"
                          max="8"
                        />
                      </div>
                      <span className="text-gray-500">ft</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={formData.heightInches}
                          onChange={(e) => updateFormData('heightInches', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Inches"
                          min="0"
                          max="11"
                        />
                      </div>
                      <span className="text-gray-500">in</span>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-center max-w-xs">
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) => updateFormData('heightCm', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Height in cm"
                        min="50"
                        max="250"
                      />
                      <span className="text-gray-500">cm</span>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => updateFormData('weight', e.target.value)}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 160 lbs or 73kg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 160 lbs or 73kg</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lifestyle */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Lifestyle</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'].map((level) => (
                    <button
                      key={level}
                      onClick={() => updateFormData('activityLevel', level)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.activityLevel === level
                          ? 'border-primary-from bg-primary-from/10 text-primary-from'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-from/50'
                      }`}
                    >
                      <div className="font-medium">{level}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {level === 'Sedentary' && 'Little to no exercise'}
                        {level === 'Lightly Active' && '1-3 days/week'}
                        {level === 'Moderately Active' && '3-5 days/week'}
                        {level === 'Very Active' && '6-7 days/week'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Average Sleep (hours per night)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="0.5"
                    value={formData.sleepHours || 7}
                    onChange={(e) => updateFormData('sleepHours', e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                    {formData.sleepHours || 7} h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Health Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Health Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Medications
                </label>
                <textarea
                  value={formData.medications}
                  onChange={(e) => updateFormData('medications', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="List medications separated by commas (e.g., Aspirin, Metformin) or type 'None'"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple medications with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Conditions
                </label>
                <textarea
                  value={formData.conditions}
                  onChange={(e) => updateFormData('conditions', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="List conditions separated by commas (e.g., Diabetes, Hypertension) or type 'None'"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allergies
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => updateFormData('allergies', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="List allergies separated by commas (e.g., Peanuts, Shellfish, Penicillin) or type 'None'"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Include food, medication, and environmental allergies</p>
              </div>
            </div>
          )}

          {/* Step 4: Dietary Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Dietary Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Diet Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Other'].map((diet) => (
                    <button
                      key={diet}
                      onClick={() => updateFormData('dietType', diet)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.dietType === diet
                          ? 'border-primary-from bg-primary-from/10 text-primary-from'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-from/50'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dietary Restrictions
                </label>
                <textarea
                  value={formData.restrictions}
                  onChange={(e) => updateFormData('restrictions', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="List restrictions separated by commas (e.g., Gluten-free, Dairy-free, Nut-free) or type 'None'"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple restrictions with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => updateFormData('goals', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="List your health goals separated by commas (e.g., Improve energy, Better sleep, Weight management, Immune support)"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Be specific about what you want to achieve</p>
              </div>
            </div>
          )}

          {/* Step 5: Upload Health Data */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">Upload Health Data (Optional)</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Enhance your recommendations</p>
                    <p>Upload genetic data (23andMe, AncestryDNA) and recent blood work for more personalized supplement recommendations.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genetic Data
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-from/50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formData.geneticFile ? formData.geneticFile.name : 'Drop your genetic data file here or click to browse'}
                  </p>
                  <input
                    type="file"
                    accept=".txt,.csv,.zip,.pdf"
                    onChange={(e) => handleFileChange('geneticFile', e.target.files?.[0] || null)}
                    className="hidden"
                    id="genetic-file"
                  />
                  <label
                    htmlFor="genetic-file"
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Supports 23andMe, AncestryDNA formats (.txt, .csv, .zip, .pdf)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blood Work Results
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-from/50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formData.labFile ? formData.labFile.name : 'Drop your lab results here or click to browse'}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange('labFile', e.target.files?.[0] || null)}
                    className="hidden"
                    id="lab-file"
                  />
                  <label
                    htmlFor="lab-file"
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Supports PDF, PNG, JPG formats</p>
                </div>
              </div>

              {/* Test ordering section */}
              <h3 className="text-lg font-semibold mt-10">Need a test?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Order an at-home kit below, then upload the raw data to unlock deeper personalization.</p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    logo: '/logos/23andme.svg',
                    title: 'Genetic Starter Kit (23andMe)',
                    desc: 'Raw SNP file (~650k markers). No supplement advice included.',
                    link: 'https://www.23andme.com/compare/',
                  },
                  {
                    logo: '/logos/nebula.svg',
                    title: 'Nebula Genomics — 30× WGS',
                    desc: 'Whole-genome sequencing; we interpret nutrition SNPs.',
                    link: 'https://dnacomplete.com/tier-selection/',
                  },
                ].map((t) => (
                  <TestCard key={t.title} logoSrc={t.logo} title={t.title} description={t.desc} href={t.link} />
                ))}
              </div>

              {/* Current Supplements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Supplements
                </label>
                <textarea
                  value={formData.currentSupplements}
                  onChange={(e) => updateFormData('currentSupplements', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-from focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="List supplements separated by commas (e.g., Vitamin D3, Omega-3, Creatine)"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple supplements with commas</p>
              </div>

              {/* Upload step skip link */}
              <p className="text-xs text-gray-500 text-center mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="underline hover:text-primary-from"
                >
                  Skip for now → you can upload anytime from Dashboard
                </button>
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-from to-primary-to text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary-from to-primary-to hover:shadow-lg'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    See my plan
                    <Check size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'w-8 bg-gradient-to-r from-primary-from to-primary-to'
                  : step < currentStep
                  ? 'bg-primary-from'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
} 
