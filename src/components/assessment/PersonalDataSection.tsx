
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from 'lucide-react';

interface PersonalDataSectionProps {
  height: string;
  weight: string;
  neckCircumference: string;
  waistCircumference: string;
  hipCircumference: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onNeckCircumferenceChange: (value: string) => void;
  onWaistCircumferenceChange: (value: string) => void;
  onHipCircumferenceChange: (value: string) => void;
}

const PersonalDataSection = ({ 
  height, 
  weight, 
  neckCircumference,
  waistCircumference,
  hipCircumference,
  onHeightChange, 
  onWeightChange,
  onNeckCircumferenceChange,
  onWaistCircumferenceChange,
  onHipCircumferenceChange
}: PersonalDataSectionProps) => (
  <Card className="mb-8 bg-white border-green-200">
    <CardHeader>
      <CardTitle className="flex items-center text-green-800">
        <Camera className="w-5 h-5 mr-2" />
        Dados para Avaliação
      </CardTitle>
      <CardDescription>
        Confirme ou atualize suas medidas para uma análise mais precisa
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="Ex: 175"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-gray-500">Insira sua altura em centímetros</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="Ex: 70.5"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-gray-500">Insira seu peso em quilogramas</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="neckCircumference">Circunferência do Pescoço (cm)</Label>
          <Input
            id="neckCircumference"
            type="number"
            step="0.1"
            placeholder="Ex: 38.5"
            value={neckCircumference}
            onChange={(e) => onNeckCircumferenceChange(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-gray-500">Medida opcional para maior precisão</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waistCircumference">Circunferência da Cintura (cm)</Label>
          <Input
            id="waistCircumference"
            type="number"
            step="0.1"
            placeholder="Ex: 85.0"
            value={waistCircumference}
            onChange={(e) => onWaistCircumferenceChange(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-gray-500">Medida opcional para maior precisão</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="hipCircumference">Circunferência do Quadril (cm)</Label>
          <Input
            id="hipCircumference"
            type="number"
            step="0.1"
            placeholder="Ex: 95.0"
            value={hipCircumference}
            onChange={(e) => onHipCircumferenceChange(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
          <p className="text-xs text-gray-500">Medida opcional para maior precisão</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PersonalDataSection;
