import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import CreditsWidget from '@/components/credits/CreditsWidget';

interface DashboardStatsProps {
  assessments: any[];
}

const DashboardStats = ({ assessments }: DashboardStatsProps) => {
  const totalAssessments = assessments.length;
  const lastAssessment = assessments[0];

  const progressRate =
    totalAssessments > 1
      ? ((assessments[0]?.bmi - assessments[1]?.bmi) / assessments[1]?.bmi) * 100
      : 0;
  const isProgressPositive = progressRate > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      {/* Cards existentes */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssessments}</div>
          <p className="text-gray-500 text-sm">
            Desde o início do seu acompanhamento
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Última Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {lastAssessment
              ? new Date(lastAssessment.created_at).toLocaleDateString()
              : 'N/A'}
          </div>
          <p className="text-gray-500 text-sm">Data da última avaliação</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Taxa de Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {progressRate.toFixed(1)}%
            {isProgressPositive ? (
              <ArrowUpRight className="inline-block w-4 h-4 ml-1 text-green-500" />
            ) : (
              <ArrowDownLeft className="inline-block w-4 h-4 ml-1 text-red-500" />
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Comparado com a avaliação anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
