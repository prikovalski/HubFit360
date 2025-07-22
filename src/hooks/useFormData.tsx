
import { useState } from 'react';
import { FormData } from '@/types/authForm';

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    userType: 'patient',
    profession: '',
    gender: '',
    birthDate: '',
    weight: '', // Opcional mas inicializado
    height: '', // Opcional mas inicializado
    city: '',
    state: '',
    neckCircumference: '', // Opcional mas inicializado
    waistCircumference: '', // Opcional mas inicializado
    hipCircumference: '' // Opcional mas inicializado
  });

  const handleInputChange = (field: string, value: string) => {
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
      neckCircumference: '',
      waistCircumference: '',
      hipCircumference: ''
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm
  };
};
