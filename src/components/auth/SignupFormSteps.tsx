import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User, Activity, Briefcase } from "lucide-react";
import { format, parse } from "date-fns";
import { getEstados, Estado } from '@/services/stateService';
import { getCidadesByEstado, Cidade } from '@/services/cityService';
import { PhysicalActivitiesSection, PhysicalActivity } from '@/components/PhysicalActivitiesSection';
import { StepProgressIndicator } from './StepProgressIndicator';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { NavigationButtons } from './NavigationButtons';
import { validatePassword } from '@/utils/inputValidation';

interface SignupFormStepsProps {
  formData: any;
  onInputChange: (field: string, value: string | PhysicalActivity[]) => void;
  onSubmit: () => void;
  loading: boolean;
  onSwitchToLogin: () => void;
  emailError?: string;
  onEmailValidation?: (email: string) => Promise<boolean>;
}

const SignupFormSteps = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  loading, 
  onSwitchToLogin,
  emailError,
  onEmailValidation
}: SignupFormStepsProps) => {
  const [step, setStep] = useState(1);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState('');

  const isProfessional = formData.userType === 'professional';
  const maxSteps = isProfessional ? 2 : 3; // Reduzido de 5 para 3 passos para pacientes
  
  const stepTitles = isProfessional 
    ? ['Conta', 'Profissionais']
    : ['Conta', 'Pessoais', 'Atividades']; // Nova estrutura de 3 passos

  const stepIcons = {
    1: <User className="w-6 h-6 text-[#019f80]" />,
    2: isProfessional ? <Briefcase className="w-6 h-6 text-[#019f80]" /> : <User className="w-6 h-6 text-[#019f80]" />,
    3: <Activity className="w-6 h-6 text-[#019f80]" />
  };

  const professionOptions = [
    { value: 'NUTRICIONISTA', label: 'Nutricionista' },
    { value: 'MEDICO', label: 'Médico' },
    { value: 'EDUCADOR_FISICO', label: 'Educador Físico' },
    { value: 'FISIOTERAPEUTA', label: 'Fisioterapeuta' },
    { value: 'ENFERMEIRO', label: 'Enfermeiro' },
    { value: 'PSICOLOGO', label: 'Psicólogo' },
    { value: 'FARMACEUTICO', label: 'Farmacêutico' },
    { value: 'BIOMEDICO', label: 'Biomédico' },
    { value: 'DENTISTA', label: 'Dentista' },
    { value: 'TERAPEUTA_OCUPACIONAL', label: 'Terapeuta Ocupacional' }
  ];

  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    if (formData.state) {
      fetchCidades(formData.state);
    } else {
      setCidades([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.birthDate) {
      const date = new Date(formData.birthDate);
      setBirthDateInput(format(date, "dd/MM/yyyy"));
    }
  }, [formData.birthDate]);

  const fetchEstados = async () => {
    setLoadingEstados(true);
    try {
      const estadosData = await getEstados();
      setEstados(estadosData);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    } finally {
      setLoadingEstados(false);
    }
  };

  const fetchCidades = async (estadoSigla: string) => {
    setLoadingCidades(true);
    try {
      const cidadesData = await getCidadesByEstado(estadoSigla);
      setCidades(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    } finally {
      setLoadingCidades(false);
    }
  };

  const handleEstadoChange = (value: string) => {
    onInputChange('state', value);
    onInputChange('city', '');
  };

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

  const handlePhysicalActivitiesChange = (activities: PhysicalActivity[]) => {
    console.log('SignupFormSteps - Atividades físicas alteradas:', activities);
    console.log('Número de atividades:', activities.length);
    onInputChange('physicalActivities', activities);
  };

  const handleBirthDateInputChange = (value: string) => {
    const formattedValue = formatDateInput(value);
    setBirthDateInput(formattedValue);
    
    if (formattedValue.length === 10) {
      try {
        const parsedDate = parse(formattedValue, "dd/MM/yyyy", new Date());
        if (!isNaN(parsedDate.getTime())) {
          onInputChange('birthDate', parsedDate.toISOString());
        }
      } catch (error) {
        // Ignorar erro de parsing
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onInputChange('birthDate', date.toISOString());
      setBirthDateInput(format(date, "dd/MM/yyyy"));
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        const { isValid: isPasswordValid } = validatePassword(formData.password);
        return formData.email && formData.password && isPasswordValid && formData.userType && !emailError;
      case 2:
        if (isProfessional) {
          return formData.name && formData.gender && formData.birthDate && formData.profession;
        }
        // Para pacientes no passo 2: nome, gênero, data, estado, cidade (sem peso/altura)
        return formData.name && formData.gender && formData.birthDate && formData.state && formData.city;
      case 3:
        // Passo 3 não requer validação específica (atividades e objetivo são opcionais)
        return true;
      default:
        return true;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== SUBMIT DO FORMULÁRIO ===');
    console.log('FormData completo no submit:', JSON.stringify(formData, null, 2));
    console.log('Tipo de usuário:', formData.userType);
    console.log('Profissão:', formData.profession);
    onSubmit();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepProgressIndicator
        currentStep={step}
        totalSteps={maxSteps}
        stepTitles={stepTitles}
        onStepClick={(newStep) => {
          if (newStep <= step) {
            setStep(newStep);
          }
        }}
      />

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {step === 1 && (
          <FormSection
            title="Informações da Conta"
            description="Crie sua conta para começar sua jornada"
            icon={stepIcons[1]}
          >
            
            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="Tipo de Usuário"
                value={formData.userType || ''}
                onChange={(value) => onInputChange('userType', value)}
                disabled={loading}
                required
                options={[
                  { value: 'patient', label: 'Paciente - Busco avaliação para mim' },
                  { value: 'professional', label: 'Profissional - Vou avaliar pacientes' }
                ]}
                placeholder="Selecione o tipo de usuário"
                tooltip="Escolha se você é um paciente buscando avaliação ou um profissional que irá avaliar pacientes"
              />
              
              <div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => onInputChange('email', e.target.value)}
                    onBlur={() => {
                      if (formData.email && onEmailValidation) {
                        onEmailValidation(formData.email);
                      }
                    }}
                    placeholder="seuemail@exemplo.com"
                    disabled={loading}
                    className={emailError ? "border-red-500" : ""}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>
              </div>
              
              <FormField
                label="Senha"
                type="password"
                value={formData.password}
                onChange={(value) => onInputChange('password', value)}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
                required
                tooltip="Escolha uma senha forte com pelo menos 8 caracteres"
                showPasswordValidation={true}
              />
            </div>
            
            <NavigationButtons
              onNext={() => setStep(2)}
              loading={loading}
              canGoNext={canGoNext()}
            />
          </FormSection>
        )}

        {step === 2 && (
          <FormSection
            title={isProfessional ? "Dados Profissionais" : "Dados Pessoais e Localização"}
            description={isProfessional ? "Informações sobre você como profissional" : "Conte-nos sobre você e onde você está localizado"}
            icon={stepIcons[2]}
          >
            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="Nome Completo"
                value={formData.name}
                onChange={(value) => onInputChange('name', value)}
                placeholder="Seu nome completo"
                disabled={loading}
                required
              />
              
              {isProfessional && (
                <FormField
                  label="Profissão"
                  value={formData.profession || ''}
                  onChange={(value) => onInputChange('profession', value)}
                  disabled={loading}
                  required
                  options={professionOptions}
                  placeholder="Selecione sua profissão"
                  tooltip="Selecione sua área de atuação profissional"
                />
              )}
              
              <FormField
                label="Gênero"
                value={formData.gender}
                onChange={(value) => onInputChange('gender', value)}
                disabled={loading}
                required
                options={[
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Feminino', label: 'Feminino' },
                  { value: 'Outro', label: 'Outro' }
                ]}
                placeholder="Selecione o gênero"
              />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium">Data de Nascimento <span className="text-red-500">*</span></label>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={birthDateInput}
                    onChange={(e) => handleBirthDateInputChange(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    className="flex-1"
                    disabled={loading}
                    maxLength={10}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={loading}
                        className="shrink-0"
                      >
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                        onSelect={handleCalendarSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Campos Estado e Cidade movidos para o passo 2 apenas para pacientes */}
              {!isProfessional && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Estado"
                      value={formData.state}
                      onChange={handleEstadoChange}
                      disabled={loading || loadingEstados}
                      required
                      loading={loadingEstados}
                      options={estados.map(estado => ({
                        value: estado.sigla,
                        label: estado.nome
                      }))}
                      placeholder="Selecione o estado"
                    />
                    
                    <FormField
                      label="Cidade"
                      value={formData.city}
                      onChange={(value) => onInputChange('city', value)}
                      disabled={loading || loadingCidades || !formData.state}
                      required
                      loading={loadingCidades}
                      options={cidades.map(cidade => ({
                        value: String(cidade.id),
                        label: cidade.nome
                      }))}
                      placeholder={
                        !formData.state 
                          ? "Selecione primeiro o estado" 
                          : loadingCidades 
                            ? "Carregando cidades..." 
                            : "Selecione a cidade"
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <NavigationButtons
              onPrevious={() => setStep(1)}
              onNext={isProfessional ? undefined : () => setStep(3)}
              onSubmit={isProfessional ? onSubmit : undefined}
              loading={loading}
              canGoNext={canGoNext()}
              isLastStep={isProfessional}
            />
          </FormSection>
        )}

        {!isProfessional && step === 3 && (
          <FormSection
            title="Atividade Física e Objetivo"
            description="Conte sobre sua rotina de exercícios e seus objetivos"
            icon={stepIcons[3]}
          >
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Atual: {formData.physicalActivities?.length || 0} atividade(s) cadastrada(s)
              </p>
            </div>
            
            <PhysicalActivitiesSection
              activities={formData.physicalActivities || []}
              onChange={handlePhysicalActivitiesChange}
              disabled={loading}
            />

            {/* Campo Objetivo movido para após as atividades físicas */}
            <div className="mt-6">
              <FormField
                label="Objetivo"
                value={formData.goal}
                onChange={(value) => onInputChange('goal', value)}
                placeholder="Ex: Perder peso, ganhar massa muscular, melhorar condicionamento..."
                disabled={loading}
                required
                tooltip="Descreva seu principal objetivo com a avaliação nutricional"
              />
            </div>

            <NavigationButtons
              onPrevious={() => setStep(2)}
              onSubmit={onSubmit}
              loading={loading}
              isLastStep={true}
            />
          </FormSection>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 mt-8 pt-6 border-t border-gray-100">
          <span>Já tem uma conta? </span>
          <Button 
            variant="link" 
            onClick={onSwitchToLogin}
            className="text-[#019f80] hover:text-[#017a66] p-0 h-auto font-medium"
          >
            Faça login
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignupFormSteps;
