
import { useState } from 'react';
import { FormData } from '@/types/authForm';

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
    goal: '',
    chronicDisease: '',
    medicalRestriction: '',
    foodAllergy: '',
    avoidFood: '',
    physicalActivity: '',
    activityFrequency: '',
    fixedMealTimes: '',
    mustHaveFood: '',
    neckCircumference: '',
    waistCircumference: '',
    hipCircumference: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      goal: '',
      chronicDisease: '',
      medicalRestriction: '',
      foodAllergy: '',
      avoidFood: '',
      physicalActivity: '',
      activityFrequency: '',
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
