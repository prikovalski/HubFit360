
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

export const useAssessmentForm = (onSuccess: (assessment: any) => void) => {
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

  // Load patient profile data when available
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

  const validateForm = () => {
    if (!photos.front || !photos.side || !photos.back) {
      toast({
        title: "Fotos obrigatórias",
        description: "Por favor, adicione todas as três fotos (frente, lado e costas).",
        variant: "destructive"
      });
      return false;
    }

    if (!height || !weight) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, preencha altura e peso antes de fazer a avaliação.",
        variant: "destructive"
      });
      return false;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, insira valores válidos para altura e peso.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const neckNum = neckCircumference ? parseFloat(neckCircumference) : null;
    const waistNum = waistCircumference ? parseFloat(waistCircumference) : null;
    const hipNum = hipCircumference ? parseFloat(hipCircumference) : null;

    setLoading(true);

    try {
      // Update patient profile with all measurements
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
        uploadPhotoToStorage(photos.front!, `${userId}/${timestamp}/front.jpg`),
        uploadPhotoToStorage(photos.side!, `${userId}/${timestamp}/side.jpg`),
        uploadPhotoToStorage(photos.back!, `${userId}/${timestamp}/back.jpg`)
      ]);

      // Fix gender mapping
      let genderForAPI = 'male';
      if (userProfile?.gender) {
        // Map database values to API format
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
