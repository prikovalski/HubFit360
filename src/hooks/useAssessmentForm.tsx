
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';

interface AssessmentFormData {
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  sex: string;
  height: number;
  weight: number;
  neckCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
}

export const useAssessmentForm = (onSuccess: (assessment: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<{ front?: string; side?: string; back?: string }>({});
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [neckCircumference, setNeckCircumference] = useState('');
  const [waistCircumference, setWaistCircumference] = useState('');
  const [hipCircumference, setHipCircumference] = useState('');
  
  const { toast } = useToast();
  const { userProfile, patientProfile } = useUserProfile();

  // Carregar dados do perfil automaticamente quando disponíveis
  useEffect(() => {
    if (patientProfile) {
      console.log('Carregando dados do perfil do paciente:', patientProfile);
      
      if (patientProfile.height) {
        setHeight(patientProfile.height.toString());
      }
      if (patientProfile.weight) {
        setWeight(patientProfile.weight.toString());
      }
      if (patientProfile.neck_circumference) {
        setNeckCircumference(patientProfile.neck_circumference.toString());
      }
      if (patientProfile.waist_circumference) {
        setWaistCircumference(patientProfile.waist_circumference.toString());
      }
      if (patientProfile.hip_circumference) {
        setHipCircumference(patientProfile.hip_circumference.toString());
      }
    }
  }, [patientProfile]);

  const canSubmit = photos.front && photos.side && photos.back && height && weight;

  const handlePhotoUpload = (photoType: string, photoData: string) => {
    console.log('Upload de foto:', photoType);
    setPhotos(prev => ({
      ...prev,
      [photoType]: photoData
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !userProfile) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const assessmentData: AssessmentFormData = {
        frontPhoto: photos.front!,
        sidePhoto: photos.side!,
        backPhoto: photos.back!,
        sex: userProfile.gender || 'masculino',
        height: parseInt(height),
        weight: parseFloat(weight),
        neckCircumference: parseFloat(neckCircumference) || 0,
        waistCircumference: parseFloat(waistCircumference) || 0,
        hipCircumference: parseFloat(hipCircumference) || 0
      };

      console.log('Enviando dados para avaliação:', assessmentData);

      const { data, error } = await supabase.functions.invoke('create-assessment', {
        body: {
          userId: userProfile.id,
          ...assessmentData
        }
      });

      if (error) {
        console.error('Erro na função create-assessment:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar avaliação');
      }

      console.log('Avaliação criada com sucesso:', data);

      toast({
        title: "Sucesso!",
        description: data.tier === 'premium' 
          ? "Sua avaliação premium foi processada com sucesso!" 
          : "Sua avaliação básica foi processada! Você pode fazer upgrade para a versão premium.",
      });

      onSuccess(data.assessment);

    } catch (error: any) {
      console.error('Erro ao criar avaliação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar avaliação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
