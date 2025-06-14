
import AssessmentHeader from './assessment/AssessmentHeader';
import PersonalDataSection from './assessment/PersonalDataSection';
import InstructionsCard from './assessment/InstructionsCard';
import PhotoUploadSection from './assessment/PhotoUploadSection';
import SubmitSection from './assessment/SubmitSection';
import { useAssessmentForm } from '@/hooks/useAssessmentForm';
import PromptPreview from './PromptPreview';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useState } from 'react';

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
    photos,
    height,
    weight,
    neckCircumference,
    waistCircumference,
    hipCircumference,
    canSubmit,
    setHeight,
    setWeight,
    setNeckCircumference,
    setWaistCircumference,
    setHipCircumference,
    handlePhotoUpload,
    handleSubmit
  } = useAssessmentForm(handleAssessmentSuccess);

  const [prompt, setPrompt] = useState<string | null>(null);

  function handleAssessmentSuccess(assessment: any) {
    if (assessment && assessment.prompt) {
      setPrompt(assessment.prompt);
    }
    if (onSuccess) onSuccess(assessment);
  }

  return (
    <LoggedPageLayout
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
    >
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {prompt && (
            <PromptPreview prompt={prompt} onClose={() => setPrompt(null)} />
          )}
          
          <AssessmentHeader onBack={onBack} />

          <PersonalDataSection
            height={height}
            weight={weight}
            neckCircumference={neckCircumference}
            waistCircumference={waistCircumference}
            hipCircumference={hipCircumference}
            onHeightChange={setHeight}
            onWeightChange={setWeight}
            onNeckCircumferenceChange={setNeckCircumference}
            onWaistCircumferenceChange={setWaistCircumference}
            onHipCircumferenceChange={setHipCircumference}
          />

          <InstructionsCard />

          <PhotoUploadSection
            photos={photos}
            onPhotoUpload={handlePhotoUpload}
          />

          <SubmitSection
            loading={loading}
            canSubmit={!!canSubmit}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </LoggedPageLayout>
  );
};

export default AssessmentForm;
