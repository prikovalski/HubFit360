
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Plus, History } from "lucide-react";
import { useUserCredits } from "@/hooks/useUserCredits";

interface CreditsWidgetProps {
  onBuyCredits?: () => void;
  onViewHistory?: () => void;
  showActions?: boolean;
}

const CreditsWidget = ({ onBuyCredits, onViewHistory, showActions = true }: CreditsWidgetProps) => {
  const { credits, loading } = useUserCredits();

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = credits?.balance || 0;
  const hasCredits = balance > 0;

  return (
    <Card className={`transition-all duration-200 ${
      hasCredits 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
        : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
    }`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Coins className={`w-4 h-4 ${hasCredits ? 'text-green-600' : 'text-amber-600'}`} />
          Seus Créditos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {balance}
            </div>
            <Badge 
              variant={hasCredits ? "default" : "secondary"}
              className={hasCredits ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
            >
              {hasCredits ? `${balance} disponível${balance > 1 ? 's' : ''}` : 'Sem créditos'}
            </Badge>
          </div>
          
          {showActions && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={onBuyCredits}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-3 h-3 mr-1" />
                Comprar
              </Button>
              {balance > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewHistory}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <History className="w-3 h-3 mr-1" />
                  Histórico
                </Button>
              )}
            </div>
          )}
        </div>
        
        {!hasCredits && (
          <p className="text-xs text-amber-700 mt-2">
            Compre créditos para fazer suas avaliações físicas
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditsWidget;
