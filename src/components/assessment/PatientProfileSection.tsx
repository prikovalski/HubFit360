
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Activity, Heart, Utensils } from "lucide-react";

interface PatientProfileSectionProps {
  patientData: {
    name: string;
    gender: string;
    birthDate: string;
    height: string;
    weight: string;
    neckCircumference: string;
    waistCircumference: string;
    hipCircumference: string;
    goal: string;
    chronicDisease: string;
    medicalRestriction: string;
    foodAllergy: string;
    avoidFood: string;
    fixedMealTimes: string;
    mustHaveFood: string;
    physicalActivity: string;
  };
  onPatientDataChange: (field: string, value: string) => void;
}

const PatientProfileSection = ({ patientData, onPatientDataChange }: PatientProfileSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais do Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-name">Nome Completo <span className="text-red-500">*</span></Label>
              <Input
                id="patient-name"
                value={patientData.name}
                onChange={(e) => onPatientDataChange('name', e.target.value)}
                placeholder="Nome do paciente"
                required
              />
            </div>
            <div>
              <Label htmlFor="patient-gender">Gênero <span className="text-red-500">*</span></Label>
              <Select value={patientData.gender} onValueChange={(value) => onPatientDataChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="patient-birth-date">Data de Nascimento <span className="text-red-500">*</span></Label>
            <Input
              id="patient-birth-date"
              type="date"
              value={patientData.birthDate}
              onChange={(e) => onPatientDataChange('birthDate', e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados Físicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Dados Físicos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-height">Altura (cm) <span className="text-red-500">*</span></Label>
              <Input
                id="patient-height"
                type="number"
                value={patientData.height}
                onChange={(e) => onPatientDataChange('height', e.target.value)}
                placeholder="Ex: 175"
                required
              />
            </div>
            <div>
              <Label htmlFor="patient-weight">Peso (kg) <span className="text-red-500">*</span></Label>
              <Input
                id="patient-weight"
                type="number"
                value={patientData.weight}
                onChange={(e) => onPatientDataChange('weight', e.target.value)}
                placeholder="Ex: 70"
                required
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Circunferências (opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="patient-neck">Pescoço (cm)</Label>
                <Input
                  id="patient-neck"
                  type="number"
                  value={patientData.neckCircumference}
                  onChange={(e) => onPatientDataChange('neckCircumference', e.target.value)}
                  placeholder="Ex: 38"
                />
              </div>
              <div>
                <Label htmlFor="patient-waist">Cintura (cm)</Label>
                <Input
                  id="patient-waist"
                  type="number"
                  value={patientData.waistCircumference}
                  onChange={(e) => onPatientDataChange('waistCircumference', e.target.value)}
                  placeholder="Ex: 85"
                />
              </div>
              <div>
                <Label htmlFor="patient-hip">Quadril (cm)</Label>
                <Input
                  id="patient-hip"
                  type="number"
                  value={patientData.hipCircumference}
                  onChange={(e) => onPatientDataChange('hipCircumference', e.target.value)}
                  placeholder="Ex: 95"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados de Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Saúde e Atividade Física
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="patient-goal">Objetivo</Label>
            <Input
              id="patient-goal"
              value={patientData.goal}
              onChange={(e) => onPatientDataChange('goal', e.target.value)}
              placeholder="Ex: Perda de peso, ganho de massa muscular..."
            />
          </div>
          <div>
            <Label htmlFor="patient-activity">Atividade Física</Label>
            <Input
              id="patient-activity"
              value={patientData.physicalActivity}
              onChange={(e) => onPatientDataChange('physicalActivity', e.target.value)}
              placeholder="Ex: Sedentário, ativo, muito ativo..."
            />
          </div>
          <div>
            <Label htmlFor="patient-chronic">Doenças Crônicas</Label>
            <Textarea
              id="patient-chronic"
              value={patientData.chronicDisease}
              onChange={(e) => onPatientDataChange('chronicDisease', e.target.value)}
              placeholder="Diabetes, hipertensão, etc."
            />
          </div>
          <div>
            <Label htmlFor="patient-medical">Restrições Médicas</Label>
            <Textarea
              id="patient-medical"
              value={patientData.medicalRestriction}
              onChange={(e) => onPatientDataChange('medicalRestriction', e.target.value)}
              placeholder="Restrições de exercícios, medicamentos, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferências Alimentares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Preferências Alimentares
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="patient-allergy">Alergias Alimentares</Label>
            <Input
              id="patient-allergy"
              value={patientData.foodAllergy}
              onChange={(e) => onPatientDataChange('foodAllergy', e.target.value)}
              placeholder="Lactose, glúten, amendoim, etc."
            />
          </div>
          <div>
            <Label htmlFor="patient-avoid">Alimentos que Evita</Label>
            <Input
              id="patient-avoid"
              value={patientData.avoidFood}
              onChange={(e) => onPatientDataChange('avoidFood', e.target.value)}
              placeholder="Carne vermelha, açúcar, etc."
            />
          </div>
          <div>
            <Label htmlFor="patient-meal-times">Horários Fixos de Refeição</Label>
            <Input
              id="patient-meal-times"
              value={patientData.fixedMealTimes}
              onChange={(e) => onPatientDataChange('fixedMealTimes', e.target.value)}
              placeholder="Ex: 8h, 12h, 18h"
            />
          </div>
          <div>
            <Label htmlFor="patient-must-have">Alimentos Indispensáveis</Label>
            <Input
              id="patient-must-have"
              value={patientData.mustHaveFood}
              onChange={(e) => onPatientDataChange('mustHaveFood', e.target.value)}
              placeholder="Café, arroz, etc."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfileSection;
