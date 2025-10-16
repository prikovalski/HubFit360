
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhysicalActivity } from '@/components/PhysicalActivitiesSection';

export const useAssessmentForm = (onSuccess: (assessment: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'self' | 'patient'>('self');
  const [measurementMethod, setMeasurementMethod] = useState<'navy' | 'pollock_7'>('navy');
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
  const [chestFold, setChestFold] = useState('');
  const [midaxillaryFold, setMidaxillaryFold] = useState('');
  const [tricepsFold, setTricepsFold] = useState('');
  const [subscapularFold, setSubscapularFold] = useState('');
  const [abdominalFold, setAbdominalFold] = useState('');
  const [suprailiacFold, setSuprailiacFold] = useState('');
  const [thighFold, setThighFold] = useState('');
  const [patientName, setPatientName] = useState('');
  const [goal, setGoal] = useState('');
  const [physicalActivities, setPhysicalActivities] = useState<PhysicalActivity[]>([]);
  
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
    physicalActivities: [] as PhysicalActivity[],
  });

  const { toast } = useToast();

  // Enhanced validation with mandatory measurements and goal
  const canSubmit = photos.front && photos.side && photos.back && 
    (assessmentType === 'self' 
      ? height && weight && goal && (
          measurementMethod === 'navy' 
            ? (neckCircumference && waistCircumference && hipCircumference)
            : (chestFold && midaxillaryFold && tricepsFold && subscapularFold && abdominalFold && suprailiacFold && thighFold)
        )
      : patientData.name && patientData.gender && patientData.birthDate && 
        patientData.height && patientData.weight && 
        patientData.neckCircumference && patientData.waistCircumference && patientData.hipCircumference
    );

  const handlePhotoUpload = (position: 'front' | 'side' | 'back', photo: string) => {
    setPhotos(prev => ({
      ...prev,
      [position]: photo
    }));
  };

  const handlePatientDataChange = (field: string, value: string | PhysicalActivity[]) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      let errorMessage = "Por favor, preencha todos os campos obrigatórios e faça upload das 3 fotos.";
      
      // More specific error messages
      if (assessmentType === 'self') {
        if (measurementMethod === 'navy' && (!neckCircumference || !waistCircumference || !hipCircumference)) {
          errorMessage = "As medidas de circunferência (pescoço, cintura e quadril) são obrigatórias para o método Navy.";
        } else if (measurementMethod === 'pollock_7' && (!chestFold || !midaxillaryFold || !tricepsFold || !subscapularFold || !abdominalFold || !suprailiacFold || !thighFold)) {
          errorMessage = "Todas as 7 dobras cutâneas são obrigatórias para o método Pollock.";
        }
      } else {
        if (!patientData.neckCircumference || !patientData.waistCircumference || !patientData.hipCircumference) {
          errorMessage = "As medidas de circunferência do paciente (pescoço, cintura e quadril) são obrigatórias para uma análise detalhada da composição corporal.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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
        measurementMethod,
        // For self assessment, use current form data including measurements and goal
        ...(assessmentType === 'self' && {
          sex: userData.gender || 'Não informado',
          height: parseFloat(height),
          weight: parseFloat(weight),
          ...(measurementMethod === 'navy' ? {
            neckCircumference: parseFloat(neckCircumference),
            waistCircumference: parseFloat(waistCircumference),
            hipCircumference: parseFloat(hipCircumference),
          } : {
            chestFold: parseFloat(chestFold),
            midaxillaryFold: parseFloat(midaxillaryFold),
            tricepsFold: parseFloat(tricepsFold),
            subscapularFold: parseFloat(subscapularFold),
            abdominalFold: parseFloat(abdominalFold),
            suprailiacFold: parseFloat(suprailiacFold),
            thighFold: parseFloat(thighFold),
          }),
          patientName: patientName.trim() || null,
          patientData: {
            goal: goal || null,
            physicalActivities: physicalActivities || [],
          }
        }),
        // For patient assessment, use patient data
        ...(assessmentType === 'patient' && {
          sex: patientData.gender,
          height: parseFloat(patientData.height),
          weight: parseFloat(patientData.weight),
          neckCircumference: parseFloat(patientData.neckCircumference),
          waistCircumference: parseFloat(patientData.waistCircumference),
          hipCircumference: parseFloat(patientData.hipCircumference),
          patientName: patientData.name,
          patientData: {
            gender: patientData.gender,
            birthDate: patientData.birthDate,
            height: parseFloat(patientData.height),
            weight: parseFloat(patientData.weight),
            neckCircumference: parseFloat(patientData.neckCircumference),
            waistCircumference: parseFloat(patientData.waistCircumference),
            hipCircumference: parseFloat(patientData.hipCircumference),
            goal: patientData.goal || null,
            chronicDisease: patientData.chronicDisease || null,
            medicalRestriction: patientData.medicalRestriction || null,
            foodAllergy: patientData.foodAllergy || null,
            avoidFood: patientData.avoidFood || null,
            fixedMealTimes: patientData.fixedMealTimes || null,
            mustHaveFood: patientData.mustHaveFood || null,
            physicalActivity: patientData.physicalActivity || null,
            physicalActivities: patientData.physicalActivities || [],
          }
        })
      };

      console.log('Dados sendo enviados para create-assessment:', submissionData);

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
    measurementMethod,
    photos,
    height,
    weight,
    neckCircumference,
    waistCircumference,
    hipCircumference,
    chestFold,
    midaxillaryFold,
    tricepsFold,
    subscapularFold,
    abdominalFold,
    suprailiacFold,
    thighFold,
    patientName,
    goal,
    physicalActivities,
    patientData,
    canSubmit,
    setAssessmentType,
    setMeasurementMethod,
    setHeight,
    setWeight,
    setNeckCircumference,
    setWaistCircumference,
    setHipCircumference,
    setChestFold,
    setMidaxillaryFold,
    setTricepsFold,
    setSubscapularFold,
    setAbdominalFold,
    setSuprailiacFold,
    setThighFold,
    setPatientName,
    setGoal,
    setPhysicalActivities,
    handlePhotoUpload,
    handlePatientDataChange,
    handleSubmit
  };
};
