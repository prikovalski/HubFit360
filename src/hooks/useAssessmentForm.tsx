
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAssessmentForm = (onSuccess: (assessment: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'self' | 'patient'>('self');
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
  
  // Patient-specific data
  const [patientData, setPatientData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    height: '',
    weight: '',
    neckCircumference: '',
    waistCircumference: '',
    hipCircumference: '',
    goal: '',
    chronicDisease: '',
    medicalRestriction: '',
    foodAllergy: '',
    avoidFood: '',
    fixedMealTimes: '',
    mustHaveFood: '',
    physicalActivity: '',
  });

  const { toast } = useToast();

  // Validation based on assessment type
  const canSubmit = photos.front && photos.side && photos.back && 
    (assessmentType === 'self' 
      ? height && weight 
      : patientData.name && patientData.gender && patientData.birthDate && patientData.height && patientData.weight
    );

  const handlePhotoUpload = (position: 'front' | 'side' | 'back', photo: string) => {
    setPhotos(prev => ({
      ...prev,
      [position]: photo
    }));
  };

  const handlePatientDataChange = (field: string, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
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

      // Prepare data based on assessment type
      const submissionData = {
        userId: userData.id,
        frontPhoto: photos.front,
        sidePhoto: photos.side,
        backPhoto: photos.back,
        assessmentType,
        // For self assessment, use current form data
        ...(assessmentType === 'self' && {
          sex: userData.gender || 'Não informado',
          height: parseFloat(height),
          weight: parseFloat(weight),
          patientName: patientName.trim() || null
        }),
        // For patient assessment, use patient data
        ...(assessmentType === 'patient' && {
          sex: patientData.gender,
          height: parseFloat(patientData.height),
          weight: parseFloat(patientData.weight),
          patientName: patientData.name,
          patientData: {
            gender: patientData.gender,
            birthDate: patientData.birthDate,
            height: parseFloat(patientData.height),
            weight: parseFloat(patientData.weight),
            neckCircumference: patientData.neckCircumference ? parseFloat(patientData.neckCircumference) : null,
            waistCircumference: patientData.waistCircumference ? parseFloat(patientData.waistCircumference) : null,
            hipCircumference: patientData.hipCircumference ? parseFloat(patientData.hipCircumference) : null,
            goal: patientData.goal || null,
            chronicDisease: patientData.chronicDisease || null,
            medicalRestriction: patientData.medicalRestriction || null,
            foodAllergy: patientData.foodAllergy || null,
            avoidFood: patientData.avoidFood || null,
            fixedMealTimes: patientData.fixedMealTimes || null,
            mustHaveFood: patientData.mustHaveFood || null,
            physicalActivity: patientData.physicalActivity || null,
          }
        })
      };

      const { data, error } = await supabase.functions.invoke('create-assessment', {
        body: submissionData
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
    assessmentType,
    photos,
    height,
    weight,
    neckCircumference,
    waistCircumference,
    hipCircumference,
    patientName,
    patientData,
    canSubmit,
    setAssessmentType,
    setHeight,
    setWeight,
    setNeckCircumference,
    setWaistCircumference,
    setHipCircumference,
    setPatientName,
    handlePhotoUpload,
    handlePatientDataChange,
    handleSubmit
  };
};
