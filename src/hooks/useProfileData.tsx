
import { useState, useEffect } from 'react';
import { format, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { getEstados, Estado } from '@/services/stateService';
import { getCidadesByEstado, Cidade } from '@/services/cityService';
import { mapGenderFromDB, mapGenderToDB } from '@/utils/genderMapping';
import { PhysicalActivity } from '@/components/PhysicalActivitiesSection';

export const useProfileData = () => {
  const { user } = useAuth();
  const { userProfile, patientProfile, loading, updateUserProfile, createOrUpdatePatientProfile } = useUserProfile();
  const { toast } = useToast();
  
  // User profile fields
  const [name, setName] = useState(userProfile?.name || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [birthDate, setBirthDate] = useState<Date | undefined>(userProfile?.birth_date ? new Date(userProfile.birth_date) : undefined);
  const [birthDateInput, setBirthDateInput] = useState('');
  
  // Patient profile fields state variables
  const [weight, setWeight] = useState(patientProfile?.weight?.toString() || '');
  const [height, setHeight] = useState(patientProfile?.height?.toString() || '');
  const [cityId, setCityId] = useState(patientProfile?.city_id || '');
  const [estadoId, setEstadoId] = useState(patientProfile?.estado_id || '');
  const [goal, setGoal] = useState(patientProfile?.goal || '');
  const [chronicDisease, setChronicDisease] = useState(patientProfile?.chronic_disease || '');
  const [medicalRestriction, setMedicalRestriction] = useState(patientProfile?.medical_restriction || '');
  const [foodAllergy, setFoodAllergy] = useState(patientProfile?.food_allergy || '');
  const [avoidFood, setAvoidFood] = useState(patientProfile?.avoid_food || '');
  const [physicalActivity, setPhysicalActivity] = useState(patientProfile?.physical_activity || '');
  const [activityFrequency, setActivityFrequency] = useState(patientProfile?.activity_frequency || '');
  const [fixedMealTimes, setFixedMealTimes] = useState(patientProfile?.fixed_meal_times || '');
  const [mustHaveFood, setMustHaveFood] = useState(patientProfile?.must_have_food || '');
  const [neckCircumference, setNeckCircumference] = useState(patientProfile?.neck_circumference?.toString() || '');
  const [waistCircumference, setWaistCircumference] = useState(patientProfile?.waist_circumference?.toString() || '');
  const [hipCircumference, setHipCircumference] = useState(patientProfile?.hip_circumference?.toString() || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [physicalActivities, setPhysicalActivities] = useState<PhysicalActivity[]>([]);

  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setGender(mapGenderFromDB(userProfile.gender));
      setBirthDate(userProfile.birth_date ? new Date(userProfile.birth_date) : undefined);
      
      if (userProfile.birth_date) {
        const date = new Date(userProfile.birth_date);
        setBirthDateInput(format(date, "dd/MM/yyyy"));
      }
    }
    
    if (patientProfile) {
      setWeight(patientProfile.weight?.toString() || '');
      setHeight(patientProfile.height?.toString() || '');
      setCityId(patientProfile.city_id || '');
      setEstadoId(patientProfile.estado_id || '');
      setGoal(patientProfile.goal || '');
      setChronicDisease(patientProfile.chronic_disease || '');
      setMedicalRestriction(patientProfile.medical_restriction || '');
      setFoodAllergy(patientProfile.food_allergy || '');
      setAvoidFood(patientProfile.avoid_food || '');
      setPhysicalActivity(patientProfile.physical_activity || '');
      setActivityFrequency(patientProfile.activity_frequency || '');
      setFixedMealTimes(patientProfile.fixed_meal_times || '');
      setMustHaveFood(patientProfile?.must_have_food || '');
      setNeckCircumference(patientProfile?.neck_circumference?.toString() || '');
      setWaistCircumference(patientProfile?.waist_circumference?.toString() || '');
      setHipCircumference(patientProfile?.hip_circumference?.toString() || '');
      
      if (patientProfile.physical_activities && Array.isArray(patientProfile.physical_activities)) {
        setPhysicalActivities(patientProfile.physical_activities);
      } else if (patientProfile.physical_activity || patientProfile.activity_frequency) {
        setPhysicalActivities([{
          type: patientProfile.physical_activity || '',
          frequency: patientProfile.activity_frequency || ''
        }]);
      } else {
        setPhysicalActivities([]);
      }
    }
  }, [userProfile, patientProfile]);

  useEffect(() => {
    if (estadoId) {
      fetchCidades(estadoId);
    } else {
      setCidades([]);
      setCityId('');
    }
  }, [estadoId]);

  const formatDateInput = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    
    if (numbersOnly.length <= 2) {
      return numbersOnly;
    } else if (numbersOnly.length <= 4) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
    } else if (numbersOnly.length <= 8) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
    }
    return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
  };

  const fetchEstados = async () => {
    try {
      const estadosData = await getEstados();
      setEstados(estadosData);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a lista de estados.",
        variant: "destructive"
      });
    } finally {
      setLoadingEstados(false);
    }
  };

  const fetchCidades = async (estadoId: string) => {
    setLoadingCidades(true);
    try {
      const estado = estados.find(e => e.id.toString() === estadoId);
      if (estado) {
        const cidadesData = await getCidadesByEstado(estado.sigla);
        setCidades(cidadesData);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a lista de cidades.",
        variant: "destructive"
      });
    } finally {
      setLoadingCidades(false);
    }
  };

  const handleEstadoChange = (value: string) => {
    setEstadoId(value);
    setCityId('');
  };

  const handleBirthDateInputChange = (value: string) => {
    const formattedValue = formatDateInput(value);
    setBirthDateInput(formattedValue);
    
    if (formattedValue.length === 10) {
      try {
        const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date());
        if (!isNaN(parsedDate.getTime())) {
          setBirthDate(parsedDate);
        }
      } catch (error) {
        // Ignorar erro de parsing
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      setBirthDateInput(format(date, "dd/MM/yyyy"));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    if (!user) return;

    const userUpdates = {
      name,
      gender: mapGenderToDB(gender),
      birth_date: birthDate ? birthDate.toISOString() : null
    };

    const { error: userError } = await updateUserProfile(userUpdates);

    const patientUpdates = {
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      city_id: cityId || null,
      estado_id: estadoId || null,
      goal: goal || null,
      chronic_disease: chronicDisease || null,
      medical_restriction: medicalRestriction || null,
      food_allergy: foodAllergy || null,
      avoid_food: avoidFood || null,
      physical_activity: physicalActivity || null,
      activity_frequency: activityFrequency || null,
      physical_activities: physicalActivities,
      fixed_meal_times: fixedMealTimes || null,
      must_have_food: mustHaveFood || null,
      neck_circumference: neckCircumference ? parseFloat(neckCircumference) : null,
      waist_circumference: waistCircumference ? parseFloat(waistCircumference) : null,
      hip_circumference: hipCircumference ? parseFloat(hipCircumference) : null
    };

    const { error: patientError } = await createOrUpdatePatientProfile(patientUpdates);

    if (userError || patientError) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "Seu perfil foi atualizado com sucesso."
      });
    }

    setIsSaving(false);
  };

  return {
    // User profile state
    name, setName,
    gender, setGender,
    birthDate,
    birthDateInput,
    handleBirthDateInputChange,
    handleCalendarSelect,
    
    // Patient profile state
    weight, setWeight,
    height, setHeight,
    cityId, setCityId,
    estadoId,
    handleEstadoChange,
    goal, setGoal,
    chronicDisease, setChronicDisease,
    medicalRestriction, setMedicalRestriction,
    foodAllergy, setFoodAllergy,
    avoidFood, setAvoidFood,
    physicalActivity, setPhysicalActivity,
    activityFrequency, setActivityFrequency,
    fixedMealTimes, setFixedMealTimes,
    mustHaveFood, setMustHaveFood,
    neckCircumference, setNeckCircumference,
    waistCircumference, setWaistCircumference,
    hipCircumference, setHipCircumference,
    physicalActivities, setPhysicalActivities,
    
    // Location data
    estados,
    loadingEstados,
    cidades,
    loadingCidades,
    
    // Actions
    handleSaveProfile,
    isSaving,
    loading,
    userProfile
  };
};
