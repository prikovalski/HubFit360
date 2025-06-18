import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User, Heart, Activity, Shield, Utensils, Ruler } from "lucide-react";
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
}

const SignupFormSteps = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  loading, 
  onSwitchToLogin 
}: SignupFormStepsProps) => {
  const [step, setStep] = useState(1);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState('');

  const stepTitles = [
    'Conta',
    'Pessoais',
    'Físicos',
    'Atividades',
    'Saúde',
    'Alimentação',
    'Medidas'
  ];

  const stepIcons = {
    1: <User className="w-6 h-6 text-[#019f80]" />,
    2: <User className="w-6 h-6 text-[#019f80]" />,
    3: <Heart className="w-6 h-6 text-[#019f80]" />,
    4: <Activity className="w-6 h-6 text-[#019f80]" />,
    5: <Shield className="w-6 h-6 text-[#019f80]" />,
    6: <Utensils className="w-6 h-6 text-[#019f80]" />,
    7: <Ruler className="w-6 h-6 text-[#019f80]" />
  };

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
        return formData.email && formData.password && isPasswordValid;
      case 2:
        return formData.name && formData.gender && formData.birthDate;
      case 3:
        return formData.weight && formData.height && formData.state && formData.city && formData.goal;
      default:
        return true;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== SUBMIT DO FORMULÁRIO ===');
    console.log('FormData completo no submit:', JSON.stringify(formData, null, 2));
    console.log('Atividades físicas no submit:', formData.physicalActivities);
    console.log('Quantidade de atividades no submit:', formData.physicalActivities?.length || 0);
    onSubmit();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepProgressIndicator
        currentStep={step}
        totalSteps={7}
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
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => onInputChange('email', value)}
                placeholder="seuemail@exemplo.com"
                disabled={loading}
                required
                tooltip="Usaremos este email para comunicação e login"
              />
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
            title="Dados Pessoais"
            description="Conte-nos um pouco sobre você"
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
            </div>

            <NavigationButtons
              onPrevious={() => setStep(1)}
              onNext={() => setStep(3)}
              loading={loading}
              canGoNext={canGoNext()}
            />
          </FormSection>
        )}

        {step === 3 && (
          <FormSection
            title="Informações Físicas"
            description="Seus dados físicos e localização"
            icon={stepIcons[3]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Peso"
                type="number"
                value={formData.weight}
                onChange={(value) => onInputChange('weight', value)}
                placeholder="Ex: 75"
                disabled={loading}
                required
                tooltip="Seu peso atual em quilogramas"
              />
              
              <FormField
                label="Altura"
                type="number"
                value={formData.height}
                onChange={(value) => onInputChange('height', value)}
                placeholder="Ex: 175"
                disabled={loading}
                required
                tooltip="Sua altura em centímetros"
              />
              
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
              
              <div className="md:col-span-2">
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
            </div>

            <NavigationButtons
              onPrevious={() => setStep(2)}
              onNext={() => setStep(4)}
              loading={loading}
              canGoNext={canGoNext()}
            />
          </FormSection>
        )}

        {step === 4 && (
          <FormSection
            title="Atividade Física"
            description="Conte sobre sua rotina de exercícios"
            icon={stepIcons[4]}
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

            <NavigationButtons
              onPrevious={() => setStep(3)}
              onNext={() => setStep(5)}
              loading={loading}
            />
          </FormSection>
        )}

        {step === 5 && (
          <FormSection
            title="Saúde e Restrições"
            description="Informações sobre sua saúde e restrições médicas"
            icon={stepIcons[5]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Doenças Crônicas"
                value={formData.chronicDisease}
                onChange={(value) => onInputChange('chronicDisease', value)}
                placeholder="Ex: Diabetes, hipertensão, tireoide..."
                disabled={loading}
                tooltip="Informe condições médicas permanentes que possui"
              />
              
              <FormField
                label="Restrições Médicas"
                value={formData.medicalRestriction}
                onChange={(value) => onInputChange('medicalRestriction', value)}
                placeholder="Ex: Cirurgia recente, lesão, limitações..."
                disabled={loading}
                tooltip="Qualquer limitação física ou médica atual"
              />
              
              <FormField
                label="Alergias Alimentares"
                value={formData.foodAllergy}
                onChange={(value) => onInputChange('foodAllergy', value)}
                placeholder="Ex: Glúten, lactose, amendoim, frutos do mar..."
                disabled={loading}
                tooltip="Alimentos que causam reações alérgicas"
              />
              
              <FormField
                label="Alimentos a Evitar"
                value={formData.avoidFood}
                onChange={(value) => onInputChange('avoidFood', value)}
                placeholder="Ex: Frituras, açúcar, carne vermelha..."
                disabled={loading}
                tooltip="Alimentos que prefere evitar por qualquer motivo"
              />
            </div>

            <NavigationButtons
              onPrevious={() => setStep(4)}
              onNext={() => setStep(6)}
              loading={loading}
            />
          </FormSection>
        )}

        {step === 6 && (
          <FormSection
            title="Preferências Alimentares"
            description="Suas preferências e horários de alimentação"
            icon={stepIcons[6]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Horários Fixos de Refeição"
                value={formData.fixedMealTimes}
                onChange={(value) => onInputChange('fixedMealTimes', value)}
                placeholder="Ex: 7h (café), 12h (almoço), 19h (jantar)..."
                disabled={loading}
                tooltip="Horários em que costuma fazer suas refeições principais"
              />
              
              <FormField
                label="Alimentos Indispensáveis"
                value={formData.mustHaveFood}
                onChange={(value) => onInputChange('mustHaveFood', value)}
                placeholder="Ex: Café, arroz, feijão, pão..."
                disabled={loading}
                tooltip="Alimentos que não pode ficar sem no dia a dia"
              />
            </div>

            <NavigationButtons
              onPrevious={() => setStep(5)}
              onNext={() => setStep(7)}
              loading={loading}
            />
          </FormSection>
        )}

        {step === 7 && (
          <FormSection
            title="Medidas Corporais"
            description="Informações adicionais para uma análise mais precisa"
            icon={stepIcons[7]}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Circunferência do Pescoço"
                type="number"
                value={formData.neckCircumference}
                onChange={(value) => onInputChange('neckCircumference', value)}
                placeholder="Ex: 38"
                disabled={loading}
                tooltip="Medida em centímetros - opcional mas útil para cálculos"
              />
              
              <FormField
                label="Circunferência da Cintura"
                type="number"
                value={formData.waistCircumference}
                onChange={(value) => onInputChange('waistCircumference', value)}
                placeholder="Ex: 85"
                disabled={loading}
                tooltip="Medida na parte mais estreita do abdômen"
              />
              
              <FormField
                label="Circunferência do Quadril"
                type="number"
                value={formData.hipCircumference}
                onChange={(value) => onInputChange('hipCircumference', value)}
                placeholder="Ex: 95"
                disabled={loading}
                tooltip="Medida na parte mais larga do quadril"
              />
            </div>

            <NavigationButtons
              onPrevious={() => setStep(6)}
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
