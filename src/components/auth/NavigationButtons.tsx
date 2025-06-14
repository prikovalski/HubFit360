
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  isLastStep?: boolean;
  canGoNext?: boolean;
}

export const NavigationButtons = ({ 
  onPrevious, 
  onNext, 
  onSubmit, 
  loading, 
  isLastStep,
  canGoNext = true
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between items-center pt-8 border-t border-gray-100">
      {onPrevious ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <Button 
          type="submit" 
          disabled={loading || !canGoNext}
          className="bg-[#019f80] hover:bg-[#017a66] text-white px-8"
          onClick={onSubmit}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onNext}
          disabled={loading || !canGoNext}
          className="bg-[#019f80] hover:bg-[#017a66] text-white flex items-center gap-2 px-8"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
