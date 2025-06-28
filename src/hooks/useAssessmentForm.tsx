
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAssessmentForm = (onSuccess: (assessment: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState({
    front: null as string | null,
    side: null as string | null,
    back: null as string | null,
  });
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [neckCircumference, setNeckCircumference] = useState('');
  const [waistCircumference, setWaistCircumference] = useState('');
  const [hipCircumference, setHipCircumference] = useState('');
  const [patientName, setPatientName] = useState('');
  const { toast } = useToast();

  const canSubmit = photos.front && photos.side && photos.back && height && weight;

  const handlePhotoUpload = (position: 'front' | 'side' | 'back', photo: string) => {
    setPhotos(prev => ({
      ...prev,
      [position]: photo
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios e faça upload das 3 fotos.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, gender')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        throw new Error('Dados do usuário não encontrados');
      }

      const { data, error } = await supabase.functions.invoke('create-assessment', {
        body: {
          userId: userData.id,
          frontPhoto: photos.front,
          sidePhoto: photos.side,
          backPhoto: photos.back,
          sex: userData.gender || 'Não informado',
          height: parseFloat(height),
          weight: parseFloat(weight),
          patientName: patientName.trim() || null
        }
      });

      if (error) {
        console.error('Erro na função:', error);
        throw new Error(error.message || 'Erro ao processar avaliação');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido');
      }

      toast({
        title: "Sucesso!",
        description: "Avaliação processada com sucesso.",
      });

      onSuccess(data.assessment);

    } catch (error) {
      console.error('Erro ao processar avaliação:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar avaliação",
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
    patientName,
    canSubmit,
    setHeight,
    setWeight,
    setNeckCircumference,
    setWaistCircumference,
    setHipCircumference,
    setPatientName,
    handlePhotoUpload,
    handleSubmit
  };
};
