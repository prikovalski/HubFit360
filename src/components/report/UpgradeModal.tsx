
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: string;
  onUpgradeSuccess: () => void;
}

const UpgradeModal = ({ isOpen, onClose, assessmentId, onUpgradeSuccess }: UpgradeModalProps) => {
  const { hasCredits, balance, consumeCredit } = useUserCredits();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!hasCredits) {
      toast({
        title: "Créditos insuficientes",
        description: "Você precisa de créditos para fazer o upgrade. Compre créditos primeiro.",
        variant: "destructive"
      });
      return;
    }

    setUpgrading(true);

    try {
      // Chamar edge function para upgrade da avaliação
      const { data, error } = await supabase.functions.invoke('upgrade-assessment', {
        body: { assessment_id: assessmentId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Upgrade realizado!",
          description: "Sua avaliação foi atualizada para a versão premium.",
        });
        onUpgradeSuccess();
        onClose();
      }

    } catch (error: any) {
      console.error('Erro ao fazer upgrade:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upgrade. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      title: "Análise Completa por IA",
      description: "Análise detalhada da sua composição corporal"
    },
    {
      icon: <Target className="w-5 h-5 text-green-500" />,
      title: "Planejamento Nutricional",
      description: "Recomendações personalizadas de alimentação"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      title: "Projeção de Resultados",
      description: "Estimativas de progresso baseadas no seu perfil"
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      title: "Gasto Energético",
      description: "Cálculo detalhado do seu metabolismo"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade para Análise Premium
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 mb-4">
              <p className="text-gray-700">
                Sua avaliação básica está pronta! Faça o upgrade para desbloquear 
                análises avançadas e recomendações personalizadas.
              </p>
            </div>
            
            <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
              Apenas 1 crédito
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {feature.icon}
                <div>
                  <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Seus créditos</span>
            </div>
            <p className="text-blue-700">
              Você tem <strong>{balance} crédito{balance !== 1 ? 's' : ''}</strong> disponível
              {balance > 0 ? '.' : '. Você precisa comprar créditos primeiro.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={upgrading}
            >
              Manter Básico
            </Button>
            
            <Button
              onClick={handleUpgrade}
              disabled={!hasCredits || upgrading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {upgrading ? 'Fazendo Upgrade...' : 'Fazer Upgrade'}
            </Button>
          </div>

          {!hasCredits && (
            <p className="text-center text-sm text-gray-600">
              <Button variant="link" className="p-0 h-auto text-green-600">
                Comprar créditos
              </Button> para desbloquear a análise premium
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
