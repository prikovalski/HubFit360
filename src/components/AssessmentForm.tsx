
import AssessmentHeader from './assessment/AssessmentHeader';
import PersonalDataSection from './assessment/PersonalDataSection';
import InstructionsCard from './assessment/InstructionsCard';
import PhotoUploadSection from './assessment/PhotoUploadSection';
import SubmitSection from './assessment/SubmitSection';
import { useAssessmentForm } from '@/hooks/useAssessmentForm';

interface AssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const AssessmentForm = ({ onBack, onSuccess }: AssessmentFormProps) => {
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
  } = useAssessmentForm(onSuccess);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
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
  );
};

export default AssessmentForm;
