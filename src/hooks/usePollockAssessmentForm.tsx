import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePollockAssessmentForm = (userProfile: any, onSubmitSuccess: (data: any) => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'self' | 'patient'>('self');
  
  // Photos
  const [photos, setPhotos] = useState({
    front: null as string | null,
    side: null as string | null,
    back: null as string | null,
  });

  // Seven skinfolds
  const [chestFold, setChestFold] = useState('');
  const [midaxillaryFold, setMidaxillaryFold] = useState('');
  const [tricepsFold, setTricepsFold] = useState('');
  const [subscapularFold, setSubscapularFold] = useState('');
  const [abdominalFold, setAbdominalFold] = useState('');
  const [suprailiacFold, setSuprailiacFold] = useState('');
  const [thighFold, setThighFold] = useState('');

  // Patient data
  const [patientData, setPatientData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    height: '',
    weight: '',
  });

  const canSubmit = 
    photos.front && 
    photos.side && 
    photos.back &&
    chestFold &&
    midaxillaryFold &&
    tricepsFold &&
    subscapularFold &&
    abdominalFold &&
    suprailiacFold &&
    thighFold &&
    (assessmentType === 'self' || 
      (patientData.gender && patientData.birthDate && patientData.height && patientData.weight));

  const handlePhotoUpload = (type: 'front' | 'side' | 'back', photo: string) => {
    setPhotos(prev => ({ ...prev, [type]: photo }));
  };

  const handlePatientDataChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Prepare submission data
      const submissionData: any = {
        userId: user.id,
        frontPhoto: photos.front,
        sidePhoto: photos.side,
        backPhoto: photos.back,
        chestFold: parseFloat(chestFold),
        midaxillaryFold: parseFloat(midaxillaryFold),
        tricepsFold: parseFloat(tricepsFold),
        subscapularFold: parseFloat(subscapularFold),
        abdominalFold: parseFloat(abdominalFold),
        suprailiacFold: parseFloat(suprailiacFold),
        thighFold: parseFloat(thighFold),
        assessmentType,
      };

      if (assessmentType === 'self') {
        // Use user profile data
        submissionData.height = userProfile?.height || 0;
        submissionData.weight = userProfile?.weight || 0;
        submissionData.gender = userProfile?.gender || '';
        
        // Calculate age from birth_date
        if (userProfile?.birth_date) {
          const birthDate = new Date(userProfile.birth_date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          submissionData.age = age;
        }
      } else {
        // Use patient data
        submissionData.patientName = patientData.name;
        submissionData.patientData = {
          gender: patientData.gender,
          birthDate: patientData.birthDate,
          height: parseFloat(patientData.height),
          weight: parseFloat(patientData.weight),
        };
      }

      console.log('Submitting Pollock assessment:', submissionData);

      const { data, error } = await supabase.functions.invoke('create-pollock-assessment', {
        body: submissionData,
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar avaliação');
      }

      toast({
        title: "Sucesso!",
        description: "Avaliação criada com sucesso",
      });

      onSubmitSuccess(data);

    } catch (error: any) {
      console.error('Error creating Pollock assessment:', error);
      toast({
        title: "Erro ao criar avaliação",
        description: error.message || "Ocorreu um erro ao processar sua avaliação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
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
    handleSubmit,
  };
};
