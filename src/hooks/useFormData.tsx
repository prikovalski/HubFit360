
import { useState } from 'react';
import { FormData, PhysicalActivity } from '@/types/authForm';

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    userType: 'patient',
    profession: '',
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
    console.log(`Alterando campo ${field} para:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      userType: 'patient',
      profession: '',
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
    handleInputChange,
    resetForm
  };
};
