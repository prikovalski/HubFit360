import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useUserProfile } from '@/hooks/useUserProfile';

interface PollockReport {
  id: string;
  created_at: string;
  assessment_type: 'self' | 'patient';
  patient_name?: string;
  body_fat_percentage: number;
  lean_mass: number;
  fat_mass: number;
  height: number;
  weight: number;
  age: number;
  gender: string;
  chest_fold: number;
  midaxillary_fold: number;
  triceps_fold: number;
  subscapular_fold: number;
  abdominal_fold: number;
  suprailiac_fold: number;
  thigh_fold: number;
}

interface PollockReportViewerProps {
  report: PollockReport;
  onBack: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const PollockReportViewer = ({
  report,
  onBack,
  onLogoClick,
  onProfileClick,
  onLogout,
  currentPage,
  onNavigate
}: PollockReportViewerProps) => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const reportText = generateReportText();
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Relatório copiado para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o relatório",
        variant: "destructive",
      });
    }
  };

  const generateReportText = () => {
    return `
RELATÓRIO DE AVALIAÇÃO - MÉTODO POLLOCK 7 DOBRAS

${report.assessment_type === 'patient' ? `Paciente: ${report.patient_name}` : 'Autoavaliação'}
Data: ${new Date(report.created_at).toLocaleDateString('pt-BR')}

DADOS ANTROPOMÉTRICOS:
- Altura: ${report.height} cm
- Peso: ${report.weight} kg
- Idade: ${report.age} anos
- Sexo: ${report.gender === 'MALE' ? 'Masculino' : 'Feminino'}

MEDIDAS DE DOBRAS CUTÂNEAS (mm):
- Peitoral: ${report.chest_fold}
- Axilar Média: ${report.midaxillary_fold}
- Tríceps: ${report.triceps_fold}
- Subescapular: ${report.subscapular_fold}
- Abdominal: ${report.abdominal_fold}
- Supra-ilíaca: ${report.suprailiac_fold}
- Coxa: ${report.thigh_fold}

RESULTADOS DA COMPOSIÇÃO CORPORAL:
- Percentual de Gordura: ${report.body_fat_percentage?.toFixed(1)}%
- Massa Magra: ${report.lean_mass?.toFixed(1)} kg
- Massa Gorda: ${report.fat_mass?.toFixed(1)} kg
    `.trim();
  };

  const getBodyFatClassification = (bodyFat: number, gender: string) => {
    if (gender === 'MALE') {
      if (bodyFat < 6) return { label: 'Essencial', color: 'bg-blue-500' };
      if (bodyFat < 14) return { label: 'Atleta', color: 'bg-green-500' };
      if (bodyFat < 18) return { label: 'Fitness', color: 'bg-emerald-500' };
      if (bodyFat < 25) return { label: 'Aceitável', color: 'bg-yellow-500' };
      return { label: 'Obesidade', color: 'bg-red-500' };
    } else {
      if (bodyFat < 14) return { label: 'Essencial', color: 'bg-blue-500' };
      if (bodyFat < 21) return { label: 'Atleta', color: 'bg-green-500' };
      if (bodyFat < 25) return { label: 'Fitness', color: 'bg-emerald-500' };
      if (bodyFat < 32) return { label: 'Aceitável', color: 'bg-yellow-500' };
      return { label: 'Obesidade', color: 'bg-red-500' };
    }
  };

  const classification = getBodyFatClassification(report.body_fat_percentage, report.gender);

  return (
    <LoggedPageLayout
      userName={userProfile?.name || ''}
      currentPage={currentPage}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
      onNavigate={onNavigate}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Relatório
              </>
            )}
          </Button>
        </div>

        {/* Report Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Relatório de Avaliação - Método Pollock 7 Dobras
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  {report.assessment_type === 'patient' && report.patient_name
                    ? `Paciente: ${report.patient_name}`
                    : 'Autoavaliação'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data: {new Date(report.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <Badge className={`${classification.color} text-white px-4 py-2 text-base`}>
                {classification.label}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Percentual de Gordura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.body_fat_percentage?.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Massa Magra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.lean_mass?.toFixed(1)} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Massa Gorda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.fat_mass?.toFixed(1)} kg</div>
            </CardContent>
          </Card>
        </div>

        {/* Anthropometric Data */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Antropométricos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Altura</p>
                <p className="text-lg font-semibold">{report.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="text-lg font-semibold">{report.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="text-lg font-semibold">{report.age} anos</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="text-lg font-semibold">
                  {report.gender === 'MALE' ? 'Masculino' : 'Feminino'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skinfold Measurements */}
        <Card>
          <CardHeader>
            <CardTitle>Medidas de Dobras Cutâneas (mm)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Peitoral</p>
                <p className="text-lg font-semibold">{report.chest_fold} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Axilar Média</p>
                <p className="text-lg font-semibold">{report.midaxillary_fold} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tríceps</p>
                <p className="text-lg font-semibold">{report.triceps_fold} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subescapular</p>
                <p className="text-lg font-semibold">{report.subscapular_fold} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abdominal</p>
                <p className="text-lg font-semibold">{report.abdominal_fold} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supra-ilíaca</p>
                <p className="text-lg font-semibold">{report.suprailiac_fold} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coxa</p>
                <p className="text-lg font-semibold">{report.thigh_fold} mm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoggedPageLayout>
  );
};

export default PollockReportViewer;
