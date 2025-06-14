import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { getEstados, Estado } from '@/services/stateService';
import { getCidadesByEstado, Cidade } from '@/services/cityService';
import { PhysicalActivitiesSection, PhysicalActivity } from '@/components/PhysicalActivitiesSection';

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
    onInputChange('city', ''); // Reset city when state changes
  };

  const handlePhysicalActivitiesChange = (activities: PhysicalActivity[]) => {
    onInputChange('physicalActivities', activities);
  };

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Informações da Conta</h2>
              <p className="text-gray-600 mt-2">Crie sua conta para começar</p>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => onInputChange('email', e.target.value)}
                placeholder="seuemail@exemplo.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                value={formData.password}
                onChange={e => onInputChange('password', e.target.value)}
                placeholder="********"
                disabled={loading}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button type="button" onClick={() => setStep(2)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Dados Pessoais</h2>
              <p className="text-gray-600 mt-2">Informe seus dados pessoais</p>
            </div>
            
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => onInputChange('name', e.target.value)}
                placeholder="Seu nome completo"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select value={formData.gender} onValueChange={value => onInputChange('gender', value)} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.birthDate ? format(new Date(formData.birthDate), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                    onSelect={(date) => onInputChange('birthDate', date ? date.toISOString() : '')}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Informações Físicas</h2>
              <p className="text-gray-600 mt-2">Informe seus dados físicos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  type="number"
                  id="weight"
                  value={formData.weight}
                  onChange={e => onInputChange('weight', e.target.value)}
                  placeholder="Ex: 75"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  type="number"
                  id="height"
                  value={formData.height}
                  onChange={e => onInputChange('height', e.target.value)}
                  placeholder="Ex: 175"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.state} onValueChange={handleEstadoChange} disabled={loading || loadingEstados}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.sigla}>
                        {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Select value={formData.city} onValueChange={value => onInputChange('city', value)} disabled={loading || loadingCidades || !formData.state}>
                  <SelectTrigger className="w-full">
                    <SelectValue 
                      placeholder={
                        !formData.state 
                          ? "Selecione primeiro o estado" 
                          : loadingCidades 
                            ? "Carregando cidades..." 
                            : "Selecione a cidade"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade.id} value={String(cidade.id)}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Input
                  type="text"
                  id="goal"
                  value={formData.goal}
                  onChange={e => onInputChange('goal', e.target.value)}
                  placeholder="Ex: Perder peso, ganhar massa muscular..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep(4)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Atividade Física</h2>
              <p className="text-gray-600 mt-2">Conte sobre sua rotina de exercícios</p>
            </div>
            
            <PhysicalActivitiesSection
              activities={formData.physicalActivities}
              onChange={handlePhysicalActivitiesChange}
              disabled={loading}
            />

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep(5)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Saúde e Restrições</h2>
              <p className="text-gray-600 mt-2">Informações sobre sua saúde e restrições</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chronicDisease">Doenças Crônicas</Label>
                <Input
                  id="chronicDisease"
                  value={formData.chronicDisease}
                  onChange={e => onInputChange('chronicDisease', e.target.value)}
                  placeholder="Ex: Diabetes, hipertensão..."
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="medicalRestriction">Restrições Médicas</Label>
                <Input
                  id="medicalRestriction"
                  value={formData.medicalRestriction}
                  onChange={e => onInputChange('medicalRestriction', e.target.value)}
                  placeholder="Ex: Cirurgia, lesão..."
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="foodAllergy">Alergias Alimentares</Label>
                <Input
                  id="foodAllergy"
                  value={formData.foodAllergy}
                  onChange={e => onInputChange('foodAllergy', e.target.value)}
                  placeholder="Ex: Glúten, lactose..."
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="avoidFood">Alimentos a Evitar</Label>
                <Input
                  id="avoidFood"
                  value={formData.avoidFood}
                  onChange={e => onInputChange('avoidFood', e.target.value)}
                  placeholder="Ex: Frituras, açúcar..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(4)}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep(6)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Preferências Alimentares</h2>
              <p className="text-gray-600 mt-2">Suas preferências e horários de alimentação</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fixedMealTimes">Horários Fixos de Refeição</Label>
                <Input
                  id="fixedMealTimes"
                  value={formData.fixedMealTimes}
                  onChange={e => onInputChange('fixedMealTimes', e.target.value)}
                  placeholder="Ex: 8h, 12h, 18h..."
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="mustHaveFood">Alimentos Indispensáveis</Label>
                <Input
                  id="mustHaveFood"
                  value={formData.mustHaveFood}
                  onChange={e => onInputChange('mustHaveFood', e.target.value)}
                  placeholder="Ex: Café, arroz..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(5)}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep(7)}>
                Próximo
              </Button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Medidas Corporais</h2>
              <p className="text-gray-600 mt-2">Informações adicionais para uma análise mais precisa</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="neckCircumference">Circunferência do Pescoço (cm)</Label>
                <Input
                  id="neckCircumference"
                  value={formData.neckCircumference}
                  onChange={e => onInputChange('neckCircumference', e.target.value)}
                  placeholder="Ex: 38"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="waistCircumference">Circunferência da Cintura (cm)</Label>
                <Input
                  id="waistCircumference"
                  value={formData.waistCircumference}
                  onChange={e => onInputChange('waistCircumference', e.target.value)}
                  placeholder="Ex: 85"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="hipCircumference">Quadril (cm)</Label>
                <Input
                  id="hipCircumference"
                  value={formData.hipCircumference}
                  onChange={e => onInputChange('hipCircumference', e.target.value)}
                  placeholder="Ex: 95"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(6)}>
                Voltar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500">
          Já tem uma conta? <Button variant="link" onClick={onSwitchToLogin}>Faça login</Button>
        </div>
      </form>
    </div>
  );
};

export default SignupFormSteps;
