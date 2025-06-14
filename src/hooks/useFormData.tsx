
import { useState } from 'react';
import { FormData, PhysicalActivity } from '@/types/authForm';

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    gender: '',
    birthDate: '',
    weight: '',
    height: '',
    city: '',
    state: '',
    goal: '',
    intensity: '',
    chronicDisease: '',
    medicalRestriction: '',
    foodAllergy: '',
    avoidFood: '',
    physicalActivity: '',
    activityFrequency: '',
    physicalActivities: [],
    fixedMealTimes: '',
    mustHaveFood: '',
    neckCircumference: '',
    waistCircumference: '',
    hipCircumference: ''
  });

  const handleInputChange = (field: string, value: string | PhysicalActivity[]) => {
    console.log(`Atualizando campo ${field}:`, value);
    
    if (field === 'physicalActivities') {
      console.log('Atualizando atividades físicas:', value);
      console.log('Tipo do valor:', typeof value);
      console.log('É array?', Array.isArray(value));
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'physicalActivities') {
        console.log('FormData atualizado com atividades físicas:', newData.physicalActivities);
      }
      
      return newData;
    });
  };

  const resetFormData = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      gender: '',
      birthDate: '',
      weight: '',
      height: '',
      city: '',
      state: '',
      goal: '',
      intensity: '',
      chronicDisease: '',
      medicalRestriction: '',
      foodAllergy: '',
      avoidFood: '',
      physicalActivity: '',
      activityFrequency: '',
      physicalActivities: [],
      fixedMealTimes: '',
      mustHaveFood: '',
      neckCircumference: '',
      waistCircumference: '',
      hipCircumference: ''
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetFormData
  };
};
