
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
  name: string;
  gender: string;
  birthDate: string;
  weight: string;
  height: string;
  city: string;
  goal: string;
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
  onSwitchToLogin: () => void;
}

export const SignupFormSteps = ({ 
  step, 
  formData, 
  loading, 
  onInputChange, 
  onSubmit, 
  onSwitchToLogin 
}: SignupFormStepsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {step === 1 && (
        <>
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => onInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => onInputChange('weight', e.target.value)}
                placeholder="70.5"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => onInputChange('height', e.target.value)}
                placeholder="175.0"
                disabled={loading}
              />
            </div>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div>
            <Label htmlFor="foodAllergy">Alergias Alimentares</Label>
            <Input
              id="foodAllergy"
              value={formData.foodAllergy}
              onChange={(e) => onInputChange('foodAllergy', e.target.value)}
              placeholder="Ex: Lactose, glúten..."
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="chronicDisease">Doenças Crônicas</Label>
            <Input
              id="chronicDisease"
              value={formData.chronicDisease}
              onChange={(e) => onInputChange('chronicDisease', e.target.value)}
              placeholder="Ex: Diabetes, hipertensão..."
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="medicalRestriction">Restrições Médicas</Label>
            <Input
              id="medicalRestriction"
              value={formData.medicalRestriction}
              onChange={(e) => onInputChange('medicalRestriction', e.target.value)}
              placeholder="Alguma restrição médica?"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="neckCircumference">Pescoço (cm)</Label>
              <Input
                id="neckCircumference"
                type="number"
                step="0.1"
                value={formData.neckCircumference}
                onChange={(e) => onInputChange('neckCircumference', e.target.value)}
                placeholder="35.0"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="waistCircumference">Cintura (cm)</Label>
              <Input
                id="waistCircumference"
                type="number"
                step="0.1"
                value={formData.waistCircumference}
                onChange={(e) => onInputChange('waistCircumference', e.target.value)}
                placeholder="80.0"
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
        </>
      )}

      <Button 
        type="submit"
        className="w-full bg-[#019f80] hover:bg-[#017a63] text-white"
        disabled={loading}
      >
        {loading ? 'Processando...' : 'Finalizar Cadastro'}
      </Button>

      {step === 1 && (
        <div className="text-center">
          <button 
            onClick={onSwitchToLogin}
            className="text-[#019f80] hover:underline"
            disabled={loading}
          >
            Já tem conta? Fazer login
          </button>
        </div>
      )}
    </form>
  );
};
