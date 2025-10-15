import { Brain, ArrowLeft, User, Calendar, TrendingUp, Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserCredits } from '@/hooks/useUserCredits';
interface TDAHReportViewerProps {
  report: any;
  onBack: () => void;
}
const TDAHReportViewer = ({
  report,
  onBack
}: TDAHReportViewerProps) => {
  const {
    toast
  } = useToast();
  const {
    hasCredits,
    balance,
    fetchCredits
  } = useUserCredits();
  const [upgrading, setUpgrading] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);
  const handleUpgrade = async () => {
    if (!hasCredits) {
      toast({
        title: "Créditos insuficientes",
        description: "Você precisa de créditos para fazer upgrade do relatório.",
        variant: "destructive"
      });
      return;
    }
    setUpgrading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('upgrade-tdah-assessment', {
        body: {
          assessment_id: currentReport.id
        }
      });
      if (error) throw error;
      toast({
        title: "Upgrade realizado!",
        description: "Seu relatório foi atualizado com análise detalhada por IA."
      });

      // Update current report with the new data
      setCurrentReport({
        ...currentReport,
        is_premium: true,
        full_report: data.full_report
      });

      // Refresh credits
      await fetchCredits();
    } catch (error: any) {
      console.error('Erro ao fazer upgrade:', error);
      toast({
        title: "Erro ao fazer upgrade",
        description: error.message || "Ocorreu um erro ao processar seu upgrade.",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };
  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case 'improvável':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'possível':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'provável':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'altamente provável':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };
  const getEffectiveScore = () => {
    const method = currentReport?.assessment_method;
    const base = currentReport?.score ?? 0;
    if (method === 'DIVA 2.0') {
      if (base && base > 0) return base;
      const scores = (currentReport?.responses as any)?.scores;
      const adult = (scores?.inattentionAdulthood ?? 0) + (scores?.hyperactivityAdulthood ?? 0);
      const totalScore = scores?.totalScore ?? adult;
      return totalScore ?? 0;
    }
    return base ?? 0;
  };
  const getMaxScore = () => (currentReport?.assessment_method === 'DIVA 2.0' ? 18 : 72);
  const getScorePercentage = () => {
    const max = getMaxScore();
    const score = getEffectiveScore();
    return max > 0 ? (score / max) * 100 : 0;
  };
  return <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Relatório TDAH</h1>
              <p className="text-sm text-muted-foreground">
                Resultado da avaliação {currentReport?.assessment_method || 'ASRS-18'}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.patient_name && <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{report.patient_name}</p>
              </div>}
            {report.patient_gender && <div>
                <p className="text-sm text-muted-foreground">Gênero</p>
                <p className="font-medium">
                  {report.patient_gender === 'MALE' ? 'Masculino' : report.patient_gender === 'FEMALE' ? 'Feminino' : 'Outro'}
                </p>
              </div>}
            {report.patient_age && <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-medium">{report.patient_age} anos</p>
              </div>}
            <div>
              <p className="text-sm text-muted-foreground">Data da Avaliação</p>
              <p className="font-medium">
                {format(new Date(report.created_at), 'dd/MM/yyyy', {
                locale: ptBR
              })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pontuação e Classificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{getEffectiveScore()}/{getMaxScore()}</p>
                <p className="text-sm text-muted-foreground">Pontuação Total</p>
              </div>
                <Badge className={getClassificationColor(currentReport.classification)}>
                  {currentReport.classification}
                </Badge>
            </div>

            {/* Score Bar */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{
                width: `${getScorePercentage()}%`
              }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {getScorePercentage().toFixed(1)}% da pontuação máxima
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {currentReport.recommendations && <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
              <CardDescription>
                Com base na sua pontuação, sugerimos:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{currentReport.recommendations}</p>
              </div>
            </CardContent>
          </Card>}

        {/* Premium Upgrade or Full Report */}
        {!currentReport.is_premium ? <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 font-extrabold">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-600">Análise Detalhada com IA</CardTitle>
                    <CardDescription>
                      Obtenha insights profundos e personalizados sobre seus resultados
                    </CardDescription>
                  </div>
                </div>
                <Lock className="h-8 w-8 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">O que está incluído na análise premium:</p>
                <ul className="space-y-1 ml-4">
                  <li>✨ Interpretação detalhada dos seus sintomas por IA especializada</li>
                  <li>📊 Análise de padrões específicos nas suas respostas</li>
                  <li>💡 Impactos potenciais na sua vida diária</li>
                  <li>🎯 Estratégias personalizadas de manejo</li>
                  <li>📚 Recursos e materiais educativos recomendados</li>
                  <li>🔍 Próximos passos detalhados e específicos</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo do upgrade</p>
                    <p className="text-2xl font-bold text-blue-600">1 Crédito</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seus créditos</p>
                    <p className="text-2xl font-bold">{balance}</p>
                  </div>
                </div>

                <Button onClick={handleUpgrade} disabled={!hasCredits || upgrading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="lg">
                  {upgrading ? <>Gerando análise...</> : <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Fazer Upgrade (1 crédito)
                    </>}
                </Button>

                {!hasCredits && <p className="text-sm text-destructive text-center mt-2">
                    Você não possui créditos suficientes
                  </p>}
              </div>
            </CardContent>
          </Card> : currentReport.full_report ? <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle>Análise Detalhada com IA</CardTitle>
              </div>
              <CardDescription>
                Relatório completo gerado por inteligência artificial especializada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{currentReport.full_report}</p>
              </div>
            </CardContent>
          </Card> : null}

        {/* Disclaimer */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-yellow-700">Aviso Importante</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Esta avaliação é uma ferramenta de triagem e NÃO substitui um diagnóstico profissional.
            </p>
            <p>
              {currentReport?.assessment_method === 'DIVA 2.0' 
                ? 'O DIVA 2.0 é uma entrevista diagnóstica estruturada validada cientificamente para identificar sinais de TDAH em adultos, baseada nos critérios do DSM-5. No entanto, apenas um profissional de saúde mental qualificado pode realizar um diagnóstico definitivo.'
                : 'O ASRS-18 é um questionário validado cientificamente para identificar sinais de TDAH, mas apenas um profissional de saúde mental qualificado pode realizar um diagnóstico definitivo.'}
            </p>
            <p>
              {currentReport?.assessment_method === 'DIVA 2.0'
                ? 'Se os resultados indicarem a presença de sintomas significativos de TDAH tanto na infância quanto na vida adulta, recomendamos fortemente que você consulte um psiquiatra ou psicólogo especializado em TDAH para uma avaliação diagnóstica completa.'
                : 'Se você pontuou na categoria "Possível", "Provável" ou "Altamente Provável", recomendamos fortemente que você consulte um psiquiatra ou psicólogo especializado em TDAH.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default TDAHReportViewer;