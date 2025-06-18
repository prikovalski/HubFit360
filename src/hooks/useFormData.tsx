
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
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
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
