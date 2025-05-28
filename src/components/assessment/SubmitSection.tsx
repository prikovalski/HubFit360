
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface SubmitSectionProps {
  loading: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

const SubmitSection = ({ loading, canSubmit, onSubmit }: SubmitSectionProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-center">
        <Button 
          onClick={onSubmit}
          disabled={loading || !canSubmit}
          className="bg-[#019f80] hover:bg-[#017a63] text-white px-8 py-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processando Avaliação...
            </>
          ) : (
            'Solicitar Avaliação'
          )}
        </Button>
        {!canSubmit && (
          <p className="text-sm text-gray-500 mt-2">
            Complete todos os campos e adicione as três fotos para continuar
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default SubmitSection;
