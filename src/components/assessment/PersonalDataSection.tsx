
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from 'lucide-react';

interface PersonalDataSectionProps {
  height: string;
  weight: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
}

const PersonalDataSection = ({ 
  height, 
  weight, 
  onHeightChange, 
  onWeightChange 
}: PersonalDataSectionProps) => (
  <Card className="mb-8 bg-white border-green-200">
    <CardHeader>
      <CardTitle className="flex items-center text-green-800">
        <Camera className="w-5 h-5 mr-2" />
        Dados para Avaliação
      </CardTitle>
      <CardDescription>
        Confirme ou atualize sua altura e peso para uma análise mais precisa
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
      </div>
    </CardContent>
  </Card>
);

export default PersonalDataSection;
