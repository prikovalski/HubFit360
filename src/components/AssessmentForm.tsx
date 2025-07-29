
import AssessmentHeader from './assessment/AssessmentHeader';
import PersonalDataSection from './assessment/PersonalDataSection';
import AssessmentTypeSelector from './assessment/AssessmentTypeSelector';
import PatientProfileSection from './assessment/PatientProfileSection';
import InstructionsCard from './assessment/InstructionsCard';
import PhotoUploadSection from './assessment/PhotoUploadSection';
import SubmitSection from './assessment/SubmitSection';
import PhysicalActivityGoalSection from './assessment/PhysicalActivityGoalSection';
import { useAssessmentForm } from '@/hooks/useAssessmentForm';
import PromptPreview from './PromptPreview';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { FormSkeleton } from '@/components/ui/form-skeleton';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useState, useEffect } from 'react';
import { MeasurementInstructionsModal } from './assessment/MeasurementInstructionsModal';

interface AssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const AssessmentForm = ({ onBack, onSuccess, onLogoClick, onProfileClick, onLogout }: AssessmentFormProps) => {
  const {
    loading,
    assessmentType,
    photos,
    height,
    weight,
    neckCircumference,
    waistCircumference,
    hipCircumference,
    patientName,
    goal,
    physicalActivities,
    patientData,
    canSubmit,
    setAssessmentType,
    setHeight,
    setWeight,
    setNeckCircumference,
    setWaistCircumference,
    setHipCircumference,
    setPatientName,
    setGoal,
    setPhysicalActivities,
    handlePhotoUpload,
    handlePatientDataChange,
    handleSubmit
  } = useAssessmentForm(handleAssessmentSuccess);

  const [prompt, setPrompt] = useState<string | null>(null);
  const [formReady, setFormReady] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Show instructions modal on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Passar as fotos diretamente (elas já são strings base64 ou null)
  const adaptedPhotos = {
    front: photos.front,
    side: photos.side,
    back: photos.back,
  };

  const handlePhotoUploadAdapter = (position: 'front' | 'side' | 'back', file: File) => {
    // Convert File to base64 string for the hook
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handlePhotoUpload(position, base64);
    };
    reader.readAsDataURL(file);
  };

  function handleAssessmentSuccess(assessment: any) {
    if (assessment && assessment.prompt) {
      setPrompt(assessment.prompt);
    }
    
    // Para todas as avaliações, chamar o callback de sucesso
    console.log('Avaliação concluída com sucesso:', assessment?.tier);
    if (onSuccess) onSuccess(assessment);
  }

  return (
    <LoggedPageLayout
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
    >
      <LoadingOverlay 
        isVisible={loading} 
        text="Processando sua avaliação física..."
      />
      
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <MeasurementInstructionsModal
            open={showInstructions}
            onOpenChange={setShowInstructions}
          />
          
          {prompt && (
            <PromptPreview prompt={prompt} onClose={() => setPrompt(null)} />
          )}
          
          {!formReady ? (
            <FormSkeleton />
          ) : (
            <>
              <AssessmentHeader onBack={onBack} />

              <AssessmentTypeSelector 
                assessmentType={assessmentType} 
                onTypeChange={setAssessmentType} 
              />

              {assessmentType === 'self' ? (
                <>
                  <PersonalDataSection
                    height={height}
                    weight={weight}
                    neckCircumference={neckCircumference}
                    waistCircumference={waistCircumference}
                    hipCircumference={hipCircumference}
                    patientName={patientName}
                    onHeightChange={setHeight}
                    onWeightChange={setWeight}
                    onNeckCircumferenceChange={setNeckCircumference}
                    onWaistCircumferenceChange={setWaistCircumference}
                    onHipCircumferenceChange={setHipCircumference}
                    onPatientNameChange={setPatientName}
                    onShowInstructions={() => setShowInstructions(true)}
                  />
                  
                  <PhysicalActivityGoalSection
                    goal={goal}
                    physicalActivities={physicalActivities}
                    onGoalChange={setGoal}
                    onPhysicalActivitiesChange={setPhysicalActivities}
                  />
                </>
              ) : (
                <PatientProfileSection
                  patientData={patientData}
                  onPatientDataChange={handlePatientDataChange}
                  onShowInstructions={() => setShowInstructions(true)}
                />
              )}

              <InstructionsCard />

              <PhotoUploadSection
                photos={adaptedPhotos}
                onPhotoUpload={handlePhotoUploadAdapter}
              />

              <SubmitSection
                loading={loading}
                canSubmit={!!canSubmit}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
    </LoggedPageLayout>
  );
};

export default AssessmentForm;
