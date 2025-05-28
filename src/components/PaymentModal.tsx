
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, Pix, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, reportId, onPaymentSuccess }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  const handlePayment = async () => {
    if (!userProfile) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Iniciando pagamento para report:', reportId);

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          reportId,
          userEmail: userProfile.email,
          userName: userProfile.name
        }
      });

      if (error) {
        console.error('Erro na função create-payment:', error);
        throw error;
      }

      console.log('Resposta da função create-payment:', data);

      if (data.init_point) {
        // Redirecionar para o Mercado Pago
        window.location.href = data.sandbox_init_point || data.init_point;
      } else {
        throw new Error('URL de pagamento não recebida');
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-gray-800">
            Desbloquear Laudo Completo
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Acesso completo à análise detalhada e recomendações personalizadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preço e Destaque */}
          <div className="text-center bg-gradient-to-r from-[#019f80]/10 to-green-50 rounded-xl p-6">
            <div className="text-4xl font-bold text-[#019f80] mb-2">R$ 29,90</div>
            <p className="text-gray-600">Pagamento único • Acesso imediato</p>
            <Badge className="mt-3 bg-green-100 text-green-800 hover:bg-green-100">
              🔥 Oferta limitada
            </Badge>
          </div>

          {/* Benefícios Inclusos */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Incluso no Laudo Completo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Análise detalhada de definição muscular</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Mapeamento da distribuição de gordura</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Programa de treino personalizado</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Plano nutricional específico</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Relatório completo em PDF</span>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Formas de Pagamento Seguras
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center bg-white rounded-lg p-3 border">
                <Pix className="w-6 h-6 text-[#019f80] mr-2" />
                <span className="text-sm font-medium">PIX</span>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-3 border">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-sm font-medium">Cartão</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 text-center mt-2">
              Processado pelo Mercado Pago - 100% seguro
            </p>
          </div>

          {/* Garantia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Garantia de 7 dias</h4>
                <p className="text-sm text-amber-700">
                  Não ficou satisfeito? Devolvemos 100% do seu dinheiro
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Pagamento */}
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#019f80] to-[#4ade80] hover:from-[#017a63] hover:to-[#3bc473] text-white py-4 text-lg font-semibold rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pagar com Mercado Pago
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            Pagamento processado de forma segura pelo Mercado Pago.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
