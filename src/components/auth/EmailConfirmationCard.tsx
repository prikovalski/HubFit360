
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

interface EmailConfirmationCardProps {
  email: string;
  onResendEmail: () => void;
  onBack: () => void;
  loading?: boolean;
  resendLoading?: boolean;
}

export const EmailConfirmationCard = ({ 
  email, 
  onResendEmail, 
  onBack, 
  loading = false,
  resendLoading = false 
}: EmailConfirmationCardProps) => {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#019f80]/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#019f80]" />
          </div>
        </div>
        
        <CardTitle className="text-2xl text-gray-800">
          Verifique seu email
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          Enviamos um link de confirmação para:
          <br />
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Clique no link do email para ativar sua conta. Não esqueça de verificar sua caixa de spam.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onResendEmail}
              disabled={loading || resendLoading}
              variant="outline"
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar email'
              )}
            </Button>
            
            <Button 
              onClick={onBack}
              disabled={loading}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao cadastro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
