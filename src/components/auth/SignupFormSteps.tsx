import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from 'react';
import { getEstados, Estado } from '@/services/stateService';
import { getCidadesByEstado, Cidade } from '@/services/cityService';

interface FormData {
  email: string;
  password: string;
  name: string;
  gender: string;
  birthDate: string;
  weight: string;
  height: string;
  city: string;
  state: string; // UF do estado brasileiro
  goal: string;
  intensity: string;
  chronicDisease: string;
  medicalRestriction: string;
  foodAllergy: string;
  avoidFood: string;
  physicalActivity: string;
  activityFrequency: string;
  fixedMealTimes: string;
  mustHaveFood: string;
  neckCircumference: string;
  waistCircumference: string;
  hipCircumference: string;
}

interface SignupFormStepsProps {
  step: number;
  formData: FormData;
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPrevStep: () => void;
  onSwitchToLogin: () => void;
}

export const SignupFormSteps = ({ 
  formData, 
  loading, 
  onInputChange, 
  onSubmit, 
  onSwitchToLogin 
}: Omit<SignupFormStepsProps, 'step' | 'onPrevStep'>) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadosLoading, setEstadosLoading] = useState(false);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadesLoading, setCidadesLoading] = useState(false);

  useEffect(() => {
    setEstadosLoading(true);
    getEstados()
      .then(data => setEstados(data))
      .catch(() => setEstados([]))
      .finally(() => setEstadosLoading(false));
  }, []);

  // Buscar cidades quando o estado mudar
  useEffect(() => {
    if (!formData.state) {
      setCidades([]);
      return;
    }
    setCidadesLoading(true);
    getCidadesByEstado(formData.state)
      .then(data => setCidades(data))
      .catch(() => setCidades([]))
      .finally(() => setCidadesLoading(false));
  }, [formData.state]);

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-2xl mx-auto">
      {/* Dados Pessoais */}
      <div className="bg-green-50 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <svg className="w-7 h-7 text-green-600 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <h2 className="text-2xl font-bold text-gray-800">Dados Pessoais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-3">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => onInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => onInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>
          <div className="md:col-span-3 md:col-span-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => onInputChange('password', e.target.value)}
              placeholder="Crie uma senha segura"
              required
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <select
                id="state"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.state}
                onChange={e => onInputChange('state', e.target.value)}
                disabled={loading || estadosLoading}
                required
              >
                <option value="">Selecione</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.sigla}>
                    {estado.nome} ({estado.sigla})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <select
                id="city"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.city}
                onChange={e => onInputChange('city', e.target.value)}
                disabled={loading || cidadesLoading || !formData.state}
                required
              >
                <option value="">{cidadesLoading ? 'Carregando...' : 'Selecione'}</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={e => onInputChange('birthDate', e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gênero</Label>
            <select
              id="gender"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.gender}
              onChange={e => onInputChange('gender', e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          </div>
          <div className="w-full max-w-4xl mx-auto md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
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
                id="height"
                value={formData.height}
                onChange={e => onInputChange('height', e.target.value)}
                placeholder="Ex: 175"
                disabled={loading}
              />
            </div>
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
                type="number"
                step="0.1"
                value={formData.hipCircumference}
                onChange={(e) => onInputChange('hipCircumference', e.target.value)}
                placeholder="95.0"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <div>
            <Label htmlFor="goal">Objetivo</Label>
            <Input
              id="goal"
              value={formData.goal}
              onChange={(e) => onInputChange('goal', e.target.value)}
              placeholder="Ex: Perder peso, ganhar massa muscular..."
              disabled={loading}
            />
          </div>
      </div>

      {/* Atividade Física */}
      <div className="bg-blue-50 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <svg className="w-7 h-7 text-blue-600 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87m9-7.13a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <h2 className="text-2xl font-bold text-gray-800">Atividade Física</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="physicalActivity">Tipo de Exercício</Label>
            <Input
              id="physicalActivity"
              value={formData.physicalActivity}
              onChange={e => onInputChange('physicalActivity', e.target.value)}
              placeholder="Ex: Musculação"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="activityFrequency">Frequência (dias/semana)</Label>
            <Input
              id="activityFrequency"
              value={formData.activityFrequency}
              onChange={e => onInputChange('activityFrequency', e.target.value)}
              placeholder="Ex: 3-4 dias"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="intensity">Intensidade</Label>
            <Input
              id="intensity"
              value={formData.intensity}
              onChange={e => onInputChange('intensity', e.target.value)}
              placeholder="Ex: Moderada"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Saúde e Restrições */}
      <div className="bg-red-50 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <svg className="w-7 h-7 text-red-600 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          <h2 className="text-2xl font-bold text-gray-800">Saúde e Restrições</h2>
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
      </div>

      {/* Botão de submit */}
      <div className="pt-2">
        <Button 
          type="submit"
          className="w-full bg-[#019f80] hover:bg-[#017a63] text-white text-lg py-3"
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Finalizar Cadastro'}
        </Button>
       
       
        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#019f80] hover:underline text-sm"
            disabled={loading}
          >
            Já possui conta? Entrar
          </button>
        </div>
      </div>
    </form>
  );
};
