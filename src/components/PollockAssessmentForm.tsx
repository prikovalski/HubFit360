import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AssessmentTypeSelector from './assessment/AssessmentTypeSelector';
import PersonalDataSection from './assessment/PersonalDataSection';
import PatientProfileSection from './assessment/PatientProfileSection';
import PhotoUploadSection from './assessment/PhotoUploadSection';
import { SevenFoldsSection } from './assessment/SevenFoldsSection';
import { MeasurementInstructionsModal } from './assessment/MeasurementInstructionsModal';
import SubmitSection from './assessment/SubmitSection';
import { usePollockAssessmentForm } from '@/hooks/usePollockAssessmentForm';

interface PollockAssessmentFormProps {
  onBack: () => void;
  onSubmitSuccess: (data: any) => void;
  userProfile: any;
}

export const PollockAssessmentForm = ({ onBack, onSubmitSuccess, userProfile }: PollockAssessmentFormProps) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const {
    loading,
    assessmentType,
    setAssessmentType,
    photos,
    handlePhotoUpload,
    chestFold,
    setChestFold,
    midaxillaryFold,
    setMidaxillaryFold,
    tricepsFold,
    setTricepsFold,
    subscapularFold,
    setSubscapularFold,
    abdominalFold,
    setAbdominalFold,
    suprailiacFold,
    setSuprailiacFold,
    thighFold,
    setThighFold,
    patientData,
    handlePatientDataChange,
    canSubmit,
    handleSubmit
  } = usePollockAssessmentForm(userProfile, onSubmitSuccess);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Avaliação por Dobras Cutâneas</h1>
            <p className="text-gray-600">Método de Pollock 7 Dobras - Medição precisa da composição corporal</p>
          </div>
        </div>

        <Card className="p-6">
          <AssessmentTypeSelector
            assessmentType={assessmentType}
            onTypeChange={setAssessmentType}
          />
        </Card>

        {assessmentType === 'self' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
            <div className="space-y-4">
              <input 
                placeholder="Altura (cm)" 
                type="number"
                value={patientData.height || userProfile?.height || ''}
                onChange={(e) => handlePatientDataChange('height', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input 
                placeholder="Peso (kg)" 
                type="number"
                value={patientData.weight || userProfile?.weight || ''}
                onChange={(e) => handlePatientDataChange('weight', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <select
                value={patientData.gender || userProfile?.gender || ''}
                onChange={(e) => handlePatientDataChange('gender', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
          </Card>
        )}

        {assessmentType === 'patient' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Dados do Paciente</h3>
            <div className="space-y-4">
              <input 
                placeholder="Nome" 
                value={patientData.name}
                onChange={(e) => handlePatientDataChange('name', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input 
                placeholder="Altura (cm)" 
                type="number"
                value={patientData.height}
                onChange={(e) => handlePatientDataChange('height', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input 
                placeholder="Peso (kg)" 
                type="number"
                value={patientData.weight}
                onChange={(e) => handlePatientDataChange('weight', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload de Fotos</h3>
          <p className="text-sm text-muted-foreground mb-4">Faça upload das 3 fotos necessárias</p>
          <PhotoUploadSection
            photos={photos}
            onPhotoUpload={(position, file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                handlePhotoUpload(position, reader.result as string);
              };
              reader.readAsDataURL(file);
            }}
          />
        </Card>

        <SevenFoldsSection
          chestFold={chestFold}
          midaxillaryFold={midaxillaryFold}
          tricepsFold={tricepsFold}
          subscapularFold={subscapularFold}
          abdominalFold={abdominalFold}
          suprailiacFold={suprailiacFold}
          thighFold={thighFold}
          onChestFoldChange={setChestFold}
          onMidaxillaryFoldChange={setMidaxillaryFold}
          onTricepsFoldChange={setTricepsFold}
          onSubscapularFoldChange={setSubscapularFold}
          onAbdominalFoldChange={setAbdominalFold}
          onSuprailiacFoldChange={setSuprailiacFold}
          onThighFoldChange={setThighFold}
          onShowInstructions={() => setShowInstructions(true)}
        />

        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? 'Processando...' : 'Gerar Avaliação'}
        </Button>

        <MeasurementInstructionsModal
          open={showInstructions}
          onOpenChange={setShowInstructions}
        />
      </div>
    </div>
  );
};
