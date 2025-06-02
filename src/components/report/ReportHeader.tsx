
import { ArrowLeft, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReportHeaderProps {
  report: any;
  onBack: () => void;
  isPaid: boolean;
  onManualPaymentCheck?: () => void;
  isCheckingPayment?: boolean;
}

const ReportHeader = ({ 
  report, 
  onBack, 
  isPaid, 
  onManualPaymentCheck, 
  isCheckingPayment = false 
}: ReportHeaderProps) => {
  const getStatusBadge = () => {
    if (isPaid) {
      return <Badge className="bg-green-600 text-white">Completo</Badge>;
    }
    return <Badge variant="secondary">Básico</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        
        <div className="flex items-center gap-3">
          {!isPaid && onManualPaymentCheck && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualPaymentCheck}
              disabled={isCheckingPayment}
              className="flex items-center gap-2"
            >
              {isCheckingPayment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isCheckingPayment ? 'Verificando...' : 'Verificar Pagamento'}
            </Button>
          )}
          {getStatusBadge()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Laudo de Avaliação Física
            </h1>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(report.date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
