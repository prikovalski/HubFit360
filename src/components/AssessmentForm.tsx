import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import PhotoUploadCard from './assessment/PhotoUploadCard';
import PersonalDataSection from './assessment/PersonalDataSection';
import InstructionsCard from './assessment/InstructionsCard';
import SubmitSection from './assessment/SubmitSection';

interface AssessmentFormProps {
  onBack: () => void;
  onSuccess: (assessment: any) => void;
}

const AssessmentForm = ({ onBack, onSuccess }: AssessmentFormProps) => {
  const { toast } = useToast();
  const { userProfile, patientProfile, createOrUpdatePatientProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState({
    front: null as File | null,
    side: null as File | null,
    back: null as File | null
  });
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [neckCircumference, setNeckCircumference] = useState('');
  const [waistCircumference, setWaistCircumference] = useState('');
  const [hipCircumference, setHipCircumference] = useState('');

  // Carregar dados do perfil do paciente quando disponível
  useEffect(() => {
    if (patientProfile) {
      setHeight(patientProfile.height?.toString() || '');
      setWeight(patientProfile.weight?.toString() || '');
      setNeckCircumference(patientProfile.neck_circumference?.toString() || '');
      setWaistCircumference(patientProfile.waist_circumference?.toString() || '');
      setHipCircumference(patientProfile.hip_circumference?.toString() || '');
    }
  }, [patientProfile]);

  const handlePhotoUpload = (position: 'front' | 'side' | 'back', file: File) => {
    if (file.type.startsWith('image/')) {
      setPhotos(prev => ({ ...prev, [position]: file }));
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
    }
  };

  const uploadPhotoToStorage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('assessments')
      .upload(path, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('assessments')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!photos.front || !photos.side || !photos.back) {
      toast({
        title: "Fotos obrigatórias",
        description: "Por favor, adicione todas as três fotos (frente, lado e costas).",
        variant: "destructive"
      });
      return;
    }

    if (!height || !weight) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, preencha altura e peso antes de fazer a avaliação.",
        variant: "destructive"
      });
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const neckNum = neckCircumference ? parseFloat(neckCircumference) : null;
    const waistNum = waistCircumference ? parseFloat(waistCircumference) : null;
    const hipNum = hipCircumference ? parseFloat(hipCircumference) : null;

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, insira valores válidos para altura e peso.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Atualizar perfil do paciente com todas as medidas
      await createOrUpdatePatientProfile({
        height: heightNum,
        weight: weightNum,
        neck_circumference: neckNum,
        waist_circumference: waistNum,
        hip_circumference: hipNum
      });

      const timestamp = Date.now();
      const userId = userProfile?.id;
      
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        uploadPhotoToStorage(photos.front, `${userId}/${timestamp}/front.jpg`),
        uploadPhotoToStorage(photos.side, `${userId}/${timestamp}/side.jpg`),
        uploadPhotoToStorage(photos.back, `${userId}/${timestamp}/back.jpg`)
      ]);

      // Corrigir o mapeamento do gênero
      let genderForAPI = 'male';
      if (userProfile?.gender) {
        // Mapear os valores do banco para o formato esperado pela API
        if (userProfile.gender === 'Feminino' || userProfile.gender === 'FEMALE') {
          genderForAPI = 'female';
        } else if (userProfile.gender === 'Masculino' || userProfile.gender === 'MALE') {
          genderForAPI = 'male';
        }
      }

      console.log('Enviando para API:', {
        gender: userProfile?.gender,
        mappedGender: genderForAPI
      });

      const { data, error } = await supabase.functions.invoke('create-assessment', {
        body: {
          userId: userProfile?.id,
          frontPhoto: frontUrl,
          sidePhoto: sideUrl,
          backPhoto: backUrl,
          sex: genderForAPI,
          height: heightNum,
          weight: weightNum
        }
      });

      if (error) throw error;

      toast({
        title: "Avaliação criada com sucesso!",
        description: "Sua avaliação física foi processada."
      });

      onSuccess(data.assessment);

    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = photos.front && photos.side && photos.back && height && weight;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
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
            <h1 className="text-3xl font-bold text-gray-800">Nova Avaliação Física</h1>
            <p className="text-gray-600">Confirme seus dados e faça o upload das suas fotos para análise</p>
          </div>
        </div>

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

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <PhotoUploadCard
            position="front"
            title="Foto de Frente"
            description="Posição frontal, braços ao lado do corpo"
            exampleImage="/lovable-uploads/7e388ecd-243f-413c-92c0-21a5a3751761.png"
            photo={photos.front}
            onPhotoUpload={handlePhotoUpload}
          />
          <PhotoUploadCard
            position="side"
            title="Foto de Lado"
            description="Perfil lateral direito, braços ao lado"
            exampleImage="/lovable-uploads/42608c3f-53f3-4d0d-bb0f-5436f91b0440.png"
            photo={photos.side}
            onPhotoUpload={handlePhotoUpload}
          />
          <PhotoUploadCard
            position="back"
            title="Foto de Costas"
            description="Posição posterior, braços ao lado do corpo"
            exampleImage="/lovable-uploads/1ce37401-3eb0-4b50-b9ef-7a88ddb5fb9b.png"
            photo={photos.back}
            onPhotoUpload={handlePhotoUpload}
          />
        </div>

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
