
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Scale, Zap } from 'lucide-react';

interface MetricsOverviewProps {
  report: any;
}

const MetricsOverview = ({ report }: MetricsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Massa Magra</CardTitle>
            <Activity className="w-6 h-6 text-blue-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{report.preview.leanMass}</div>
          <p className="text-blue-100 text-sm">Músculos e ossos</p>
          <div className="mt-3 text-xs text-blue-200">
            Indica massa corporal livre de gordura
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Gordura Corporal</CardTitle>
            <Zap className="w-6 h-6 text-orange-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{report.preview.bodyFat}</div>
          <p className="text-orange-100 text-sm">Percentual de gordura</p>
          <div className="mt-3 text-xs text-orange-200">
            Medição precisa da composição corporal
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-gradient-to-br from-[#019f80] to-[#4ade80] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">IMC</CardTitle>
            <Scale className="w-6 h-6 text-green-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{report.preview.bmi}</div>
          <p className="text-green-100 text-sm">Índice de massa corporal</p>
          <div className="mt-3 text-xs text-green-200">
            Classificação padrão internacional
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsOverview;
