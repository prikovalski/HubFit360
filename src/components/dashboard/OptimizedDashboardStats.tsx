
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Assessment {
  id: string;
  created_at: string;
  bmi: number;
}

interface OptimizedDashboardStatsProps {
  assessments: Assessment[];
}

const OptimizedDashboardStats = ({ assessments }: OptimizedDashboardStatsProps) => {
  // Memoize calculations to avoid recalculation on every render
  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const lastAssessment = assessments[0];
    
    const progressRate = totalAssessments > 1 && assessments[0]?.bmi && assessments[1]?.bmi
      ? ((assessments[0].bmi - assessments[1].bmi) / assessments[1].bmi) * 100
      : 0;
    
    const isProgressPositive = progressRate > 0;

    return {
      totalAssessments,
      lastAssessment,
      progressRate,
      isProgressPositive
    };
  }, [assessments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAssessments}</div>
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
            {stats.lastAssessment
              ? new Date(stats.lastAssessment.created_at).toLocaleDateString()
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
            {stats.progressRate.toFixed(1)}%
            {stats.isProgressPositive ? (
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

export default OptimizedDashboardStats;
