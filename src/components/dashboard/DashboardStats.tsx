
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Assessment {
  id: string;
  created_at: string;
  body_fat_percentage: number;
  lean_mass: number;
  bmi: number;
  status: string;
  assessment_text: string;
}

interface DashboardStatsProps {
  assessments: Assessment[];
}

const DashboardStats = ({ assessments }: DashboardStatsProps) => {
  const latestAssessment = assessments[0];

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-[#019f80] to-[#4ade80] text-white">
        <CardHeader>
          <CardTitle className="text-lg">Total de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{assessments.length}</div>
          <p className="text-white/80 text-sm">Avaliações realizadas</p>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Última Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          {latestAssessment ? (
            <>
              <div className="text-2xl font-bold text-[#019f80]">IMC: {latestAssessment.bmi?.toFixed(1) || 'N/A'}</div>
              <p className="text-gray-600 text-sm">
                {new Date(latestAssessment.created_at).toLocaleDateString('pt-BR')}
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold text-gray-400">--</div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Gordura Corporal</CardTitle>
        </CardHeader>
        <CardContent>
          {latestAssessment ? (
            <>
              <div className="text-2xl font-bold text-green-600">{latestAssessment.body_fat_percentage?.toFixed(1) || 'N/A'}%</div>
              <p className="text-gray-600 text-sm">Última medição</p>
            </>
          ) : (
            <div className="text-2xl font-bold text-gray-400">--</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
