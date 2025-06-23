
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const CreditUserForm = () => {
  const [userEmail, setUserEmail] = useState('');
  const [creditsAmount, setCreditsAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail || !creditsAmount) {
      toast({
        title: "Erro",
        description: "Email e quantidade de créditos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('manual-add-credits', {
        body: {
          user_email: userEmail,
          credits_amount: parseInt(creditsAmount),
          reason: reason || 'Créditos adicionados manualmente via admin',
          transaction_id: transactionId || `manual-${Date.now()}`
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${creditsAmount} créditos adicionados para ${userEmail}`,
        variant: "default"
      });

      // Limpar formulário
      setUserEmail('');
      setCreditsAmount('');
      setTransactionId('');
      setReason('');

      console.log('Créditos adicionados:', data);
    } catch (error: any) {
      console.error('Erro ao adicionar créditos:', error);
      toast({
        title: "Erro",
        description: error.message || 'Falha ao adicionar créditos',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Creditar Usuário Manualmente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userEmail">Email do Usuário</Label>
            <Input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="creditsAmount">Quantidade de Créditos</Label>
            <Input
              id="creditsAmount"
              type="number"
              value={creditsAmount}
              onChange={(e) => setCreditsAmount(e.target.value)}
              placeholder="1, 5 ou 10"
              min="1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="transactionId">ID da Transação (opcional)</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="HP0950906852"
            />
          </div>
          
          <div>
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Compra via Hotmart não processada automaticamente"
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adicionando...' : 'Adicionar Créditos'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditUserForm;
