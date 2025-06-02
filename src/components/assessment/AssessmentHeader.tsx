
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface AssessmentHeaderProps {
  onBack: () => void;
}

const AssessmentHeader = ({ onBack }: AssessmentHeaderProps) => (
  <div className="flex items-center mb-8">
    <Button 
      onClick={onBack}
      variant="ghost" 
      className="mr-4"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Nova Avaliação Física</h1>
      <p className="text-gray-600">Confirme seus dados e faça o upload das suas fotos para análise</p>
    </div>
  </div>
);

export default AssessmentHeader;
