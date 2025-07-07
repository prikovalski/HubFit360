
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface PersonalDataSectionProps {
  height: string;
  weight: string;
  neckCircumference: string;
  waistCircumference: string;
  hipCircumference: string;
  patientName: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onNeckCircumferenceChange: (value: string) => void;
  onWaistCircumferenceChange: (value: string) => void;
  onHipCircumferenceChange: (value: string) => void;
  onPatientNameChange: (value: string) => void;
}

const PersonalDataSection = ({
  height,
  weight,
  neckCircumference,
  waistCircumference,
  hipCircumference,
  patientName,
  onHeightChange,
  onWeightChange,
  onNeckCircumferenceChange,
  onWaistCircumferenceChange,
  onHipCircumferenceChange,
  onPatientNameChange,
}: PersonalDataSectionProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Dados Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="patientName" className="text-sm font-medium">
              Avaliação de: <span className="text-gray-500 text-xs">(opcional)</span>
            </Label>
            <Input
              id="patientName"
              type="text"
              placeholder="Nome do paciente/aluno (deixe em branco para usar seu próprio nome)"
              value={patientName}
              onChange={(e) => onPatientNameChange(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="height" className="text-sm font-medium">
              Altura (cm) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="Ex: 175"
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="weight" className="text-sm font-medium">
              Peso (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="Ex: 70"
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Circunferências <span className="text-red-500">*</span>
            <span className="text-sm font-normal text-gray-500 ml-2">(obrigatório para análise detalhada)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="neck" className="text-sm font-medium">
                Pescoço (cm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="neck"
                type="number"
                placeholder="Ex: 38"
                value={neckCircumference}
                onChange={(e) => onNeckCircumferenceChange(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="waist" className="text-sm font-medium">
                Cintura (cm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="waist"
                type="number"
                placeholder="Ex: 85"
                value={waistCircumference}
                onChange={(e) => onWaistCircumferenceChange(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="hip" className="text-sm font-medium">
                Quadril (cm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hip"
                type="number"
                placeholder="Ex: 95"
                value={hipCircumference}
                onChange={(e) => onHipCircumferenceChange(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalDataSection;
