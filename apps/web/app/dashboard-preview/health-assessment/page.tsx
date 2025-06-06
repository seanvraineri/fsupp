"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from "@/app/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/Textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/Slider";
import { ChevronRight, ChevronLeft, Check, Upload } from 'lucide-react';

const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
    {children}
  </div>
);

const StepInfo = ({ title, description }: { title: string, description: string }) => (
  <div className="md:col-span-1">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </div>
);

const StepContent = ({ children }: { children: React.ReactNode }) => (
  <div className="md:col-span-2 space-y-4">
    {children}
  </div>
);

export default function HealthAssessmentPreviewPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    age: '', gender: '', heightFeet: '', heightInches: '', heightCm: '',
    heightUnit: 'imperial' as 'imperial' | 'metric', weight: '', activityLevel: '',
    sleepHours: '7.5', medications: '', conditions: '', allergies: '',
    dietType: '', restrictions: '', goals: '', currentSupplements: '',
    geneticFile: null as File | null, labFile: null as File | null,
  });

  const geneticFileRef = useRef<HTMLInputElement>(null);
  const labFileRef = useRef<HTMLInputElement>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const handleSubmit = () => router.push('/dashboard-preview');

  const stepVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  const renderStepContent = () => {
    switch (currentStep) {
        case 1:
            return (
                <StepWrapper>
                    <StepInfo title="Personal Information" description="Basic demographic information to help us tailor recommendations." />
                    <StepContent>
                        <div className="space-y-2">
                            <Label>Age</Label>
                            <Input type="number" placeholder="e.g., 30" value={formData.age} onChange={e => updateFormData('age', e.target.value)} className="max-w-xs" />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <RadioGroup value={formData.gender} onValueChange={v => updateFormData('gender', v)} className="flex gap-4 pt-2">
                                {['Male', 'Female', 'Other'].map(g => (
                                    <div key={g} className="flex items-center space-x-2"><RadioGroupItem value={g.toLowerCase()} id={g.toLowerCase()} /><Label htmlFor={g.toLowerCase()}>{g}</Label></div>
                                ))}
                            </RadioGroup>
                        </div>
                    </StepContent>
                </StepWrapper>
            );
        case 2:
            return (
                <StepWrapper>
                    <StepInfo title="Lifestyle" description="Tell us about your activity levels and sleep habits." />
                    <StepContent>
                        <div className="space-y-3">
                          <Label className="font-semibold">Activity Level</Label>
                          <RadioGroup value={formData.activityLevel} onValueChange={v => updateFormData('activityLevel', v)} className="grid grid-cols-2 gap-4">
                              {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'].map(level => (
                                  <Label key={level} className={`p-4 rounded-xl border-2 flex flex-col justify-center items-center cursor-pointer transition-all ${formData.activityLevel === level ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}><RadioGroupItem value={level} className="sr-only" /><span className="font-bold">{level}</span></Label>
                              ))}
                          </RadioGroup>
                      </div>
                      <div className="space-y-3">
                          <Label className="font-semibold">Average Sleep</Label>
                          <div className="flex items-center gap-4 pt-2">
                              <Slider min={4} max={12} step={0.5} value={[parseFloat(formData.sleepHours)]} onValueChange={([val]) => updateFormData('sleepHours', val.toString())} />
                              <span className="font-bold text-primary w-24 text-center py-2 rounded-md bg-muted">{formData.sleepHours} hrs</span>
                          </div>
                      </div>
                    </StepContent>
                </StepWrapper>
            );
        case 3:
            return (
                 <StepWrapper>
                    <StepInfo title="Health History" description="Please list any current medications, conditions, or allergies." />
                    <StepContent>
                        <div className="space-y-2"><Label>Current Medications</Label><Textarea placeholder="List medications, separated by commas, or type 'None'" value={formData.medications} onChange={e => updateFormData('medications', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Health Conditions</Label><Textarea placeholder="List known health conditions, or type 'None'" value={formData.conditions} onChange={e => updateFormData('conditions', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Allergies</Label><Textarea placeholder="List all known allergies, or type 'None'" value={formData.allergies} onChange={e => updateFormData('allergies', e.target.value)} /></div>
                    </StepContent>
                </StepWrapper>
            );
        case 4:
            return (
                <StepWrapper>
                    <StepInfo title="Dietary Habits" description="Let us know about your typical diet and any restrictions or goals you have." />
                    <StepContent>
                        <div className="space-y-2"><Label>Diet Type</Label><RadioGroup value={formData.dietType} onValueChange={v => updateFormData('dietType', v)} className="grid grid-cols-3 gap-2">{['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Other'].map(d=><Label key={d} className={`p-3 rounded-lg border-2 text-center cursor-pointer ${formData.dietType === d ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}><RadioGroupItem value={d} className="sr-only"/>{d}</Label>)}</RadioGroup></div>
                        <div className="space-y-2"><Label>Dietary Restrictions</Label><Textarea placeholder="List any dietary restrictions, or type 'None'" value={formData.restrictions} onChange={e => updateFormData('restrictions', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Health Goals</Label><Textarea placeholder="List your main health goals (e.g., improve energy, better sleep)" value={formData.goals} onChange={e => updateFormData('goals', e.target.value)} /></div>
                    </StepContent>
                </StepWrapper>
            );
        case 5:
             const FileUploadCard = ({ title, description, file, fileRef, onFileChange, accept }: any) => (
              <Card className="hover:border-primary/50 transition-colors cursor-pointer text-center" onClick={() => fileRef.current?.click()}>
                <CardHeader><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto"><Upload className="h-8 w-8" /></div></CardHeader>
                <CardContent><CardTitle className="text-base font-semibold">{title}</CardTitle><CardDescription>{description}</CardDescription><div className="mt-4 border-2 border-dashed border-border rounded-lg p-3 text-xs text-muted-foreground">{file ? file.name : 'Click to select a file'}</div><input ref={fileRef} type="file" accept={accept} onChange={e => onFileChange(e.target.files?.[0] || null)} className="hidden" /></CardContent>
             </Card>
            );
            return (
                <StepWrapper>
                    <StepInfo title="Upload Data" description="For the best recommendations, upload your genetic data and recent lab results." />
                    <StepContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadCard title="Genetic Data" description=".txt, .csv, .zip, .pdf" file={formData.geneticFile} fileRef={geneticFileRef} onFileChange={(file: File | null) => updateFormData('geneticFile', file)} accept=".txt,.csv,.zip,.pdf" />
                        <FileUploadCard title="Lab Results" description=".pdf, .png, .jpg" file={formData.labFile} fileRef={labFileRef} onFileChange={(file: File | null) => updateFormData('labFile', file)} accept=".pdf,.png,.jpg,.jpeg" />
                      </div>
                      <div className="space-y-2"><Label>Current Supplements</Label><Textarea placeholder="List any supplements you currently take, or type 'None'" value={formData.currentSupplements} onChange={e => updateFormData('currentSupplements', e.target.value)} /></div>
                    </StepContent>
                </StepWrapper>
            );
        default: return null;
    }
  };

  const stepTitles = ['Personal Info', 'Lifestyle', 'Health History', 'Diet', 'Uploads'];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <Card className="overflow-hidden">
            <CardHeader className="border-b p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold">Health Assessment</h1>
                    <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}: {stepTitles[currentStep-1]}</p>
                </div>
                <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
            </CardHeader>
            <CardContent className="p-6">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
            <div className="flex justify-between p-4 border-t bg-muted/50">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                {currentStep < totalSteps ? (
                    <Button onClick={nextStep}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                        See My Plan <Check className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 