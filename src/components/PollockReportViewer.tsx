import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, ArrowLeft, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { generatePollockPDF } from '@/utils/pollockPdfGenerator';

interface PollockReport {
  id: string;
  created_at: string;
  assessment_type: 'self' | 'patient';
  patient_name?: string;
  body_fat_percentage: number;
  lean_mass: number;
  fat_mass: number;
  bmi: number;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  patient_height?: number;
  patient_weight?: number;
  patient_gender?: string;
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

  // Safety check - if report is null or undefined, show error
  if (!report) {
    return (
      <LoggedPageLayout
        userName={userProfile?.name || ''}
        currentPage={currentPage}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        onNavigate={onNavigate}
      >
        <div className="container mx-auto p-6">
          <Button onClick={onBack} variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Erro ao carregar relatório. Por favor, tente novamente.</p>
            </CardContent>
          </Card>
        </div>
      </LoggedPageLayout>
    );
  }

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

  const handleGeneratePDF = () => {
    try {
      const pdf = generatePollockPDF({ report });
      const fileName = report.assessment_type === 'patient' && report.patient_name
        ? `relatorio-dobras-${report.patient_name.replace(/\s+/g, '-')}-${new Date(report.created_at).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`
        : `relatorio-dobras-${new Date(report.created_at).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      toast({
        title: "PDF Gerado!",
        description: "O relatório foi baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
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
- Altura: ${height} cm
- Peso: ${weight} kg
- Idade: ${age} anos
- Sexo: ${gender === 'MALE' ? 'Masculino' : 'Feminino'}
- IMC: ${report.bmi?.toFixed(1)} kg/m²

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
- IMC: ${report.bmi?.toFixed(1)} kg/m²
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

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'bg-blue-500' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-green-500' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'bg-yellow-500' };
    if (bmi < 35) return { label: 'Obesidade Grau I', color: 'bg-orange-500' };
    if (bmi < 40) return { label: 'Obesidade Grau II', color: 'bg-red-500' };
    return { label: 'Obesidade Grau III', color: 'bg-red-700' };
  };

  // Get correct values based on assessment type
  const height = report.height || report.patient_height || 0;
  const weight = report.weight || report.patient_weight || 0;
  const age = report.age || 0;
  const gender = report.gender || report.patient_gender || 'MALE';
  
  const classification = getBodyFatClassification(report.body_fat_percentage || 0, gender);
  const bmiClassification = getBMIClassification(report.bmi || 0);

  const compositionData = [
    { name: 'Massa Magra', value: report.lean_mass || 0, fill: 'hsl(var(--primary))' },
    { name: 'Massa Gorda', value: report.fat_mass || 0, fill: 'hsl(var(--destructive))' }
  ];

  const skinfoldData = [
    { name: 'Peitoral', value: report.chest_fold },
    { name: 'Axilar Média', value: report.midaxillary_fold },
    { name: 'Tríceps', value: report.triceps_fold },
    { name: 'Subescapular', value: report.subscapular_fold },
    { name: 'Abdominal', value: report.abdominal_fold },
    { name: 'Supra-ilíaca', value: report.suprailiac_fold },
    { name: 'Coxa', value: report.thigh_fold }
  ];

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
          <div className="flex gap-2">
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
            <Button
              onClick={handleGeneratePDF}
              variant="default"
              className="gap-2"
            >
              <FileDown className="w-4 h-4" />
              Gerar PDF
            </Button>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Massa Gorda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.fat_mass?.toFixed(1)} kg</div>
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
              <CardTitle className="text-sm font-medium">Percentual de Gordura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.body_fat_percentage?.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">IMC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{report.bmi?.toFixed(1)}</div>
              <div className="mt-2">
                <Badge className={`${bmiClassification.color} text-white`}>
                  {bmiClassification.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Body Composition Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Composição Corporal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)} kg`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anthropometric Data */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Antropométricos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Altura</p>
                <p className="text-lg font-semibold">{height} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="text-lg font-semibold">{weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="text-lg font-semibold">{age} anos</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="text-lg font-semibold">
                  {gender === 'MALE' ? 'Masculino' : 'Feminino'}
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
