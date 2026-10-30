import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GenerateAnalysisCardProps {
  functionName: 'generate-body-analysis' | 'generate-tdah-analysis';
  assessmentId: string;
  description: string;
  onGenerated: (data: { full_report?: string; already_generated?: boolean }) => void | Promise<void>;
}

const GenerateAnalysisCard = ({ functionName, assessmentId, description, onGenerated }: GenerateAnalysisCardProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { assessment_id: assessmentId }
      });

      if (error || !data?.success) throw error ?? new Error('Falha ao gerar análise');

      await onGenerated(data);
      toast({
        title: 'Análise detalhada pronta',
        description: 'A análise foi adicionada ao relatório.'
      });
    } catch (error) {
      console.error('Erro ao gerar análise detalhada:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a análise agora. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Análise detalhada por IA
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerate} disabled={generating} className="w-full sm:w-auto">
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando análise…
            </>
          ) : (
            'Gerar análise detalhada'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GenerateAnalysisCard;
