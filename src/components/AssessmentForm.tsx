
import { useState } from 'react';
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
  
  const [height, setHeight] = useState(patientProfile?.height?.toString() || '');
  const [weight, setWeight] = useState(patientProfile?.weight?.toString() || '');

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
      await createOrUpdatePatientProfile({
        height: heightNum,
        weight: weightNum
      });

      const timestamp = Date.now();
      const userId = userProfile?.id;
      
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        uploadPhotoToStorage(photos.front, `${userId}/${timestamp}/front.jpg`),
        uploadPhotoToStorage(photos.side, `${userId}/${timestamp}/side.jpg`),
        uploadPhotoToStorage(photos.back, `${userId}/${timestamp}/back.jpg`)
      ]);

      const birthDate = new Date(userProfile?.birth_date || '');
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const { data, error } = await supabase.functions.invoke('create-assessment', {
        body: {
          userId: userProfile?.id,
          frontPhoto: frontUrl,
          sidePhoto: sideUrl,
          backPhoto: backUrl,
          sex: userProfile?.gender === 'Masculino' ? 'male' : 'female',
          age: age,
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
          onHeightChange={setHeight}
          onWeightChange={setWeight}
        />

        <InstructionsCard />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <PhotoUploadCard
            position="front"
            title="Foto de Frente"
            description="Posição frontal, braços ao lado do corpo"
            exampleImage="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=600&fit=crop"
            photo={photos.front}
            onPhotoUpload={handlePhotoUpload}
          />
          <PhotoUploadCard
            position="side"
            title="Foto de Lado"
            description="Perfil lateral direito, braços ao lado"
            exampleImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop"
            photo={photos.side}
            onPhotoUpload={handlePhotoUpload}
          />
          <PhotoUploadCard
            position="back"
            title="Foto de Costas"
            description="Posição posterior, braços ao lado do corpo"
            exampleImage="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=600&fit=crop"
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
