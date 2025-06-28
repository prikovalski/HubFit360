
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, UserCheck } from "lucide-react";

interface AssessmentTypeSelectorProps {
  assessmentType: 'self' | 'patient';
  onTypeChange: (type: 'self' | 'patient') => void;
}

const AssessmentTypeSelector = ({ assessmentType, onTypeChange }: AssessmentTypeSelectorProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Tipo de Avaliação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={assessmentType} onValueChange={onTypeChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="self" id="self" />
            <Label htmlFor="self" className="flex items-center gap-2 cursor-pointer flex-1">
              <User className="w-4 h-4" />
              <div>
                <div className="font-medium">Avaliação para mim mesmo</div>
                <div className="text-sm text-gray-500">Usar dados do meu perfil</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="patient" id="patient" />
            <Label htmlFor="patient" className="flex items-center gap-2 cursor-pointer flex-1">
              <UserCheck className="w-4 h-4" />
              <div>
                <div className="font-medium">Avaliação para outra pessoa</div>
                <div className="text-sm text-gray-500">Preencher dados completos do paciente/aluno</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AssessmentTypeSelector;
