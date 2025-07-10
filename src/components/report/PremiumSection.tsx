import { CheckCircle, Crown, TrendingUp, Brain, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from '@/hooks/useUserProfile';
interface PremiumSectionProps {
  report: any;
  isPaid: boolean;
  onPaymentSuccess: () => void;
}
const PremiumSection = ({
  report,
  isPaid,
  onPaymentSuccess
}: PremiumSectionProps) => {
  const {
    userProfile,
    patientProfile
  } = useUserProfile();

  // Gerar conteúdo premium baseado nos dados reais do usuário
  const generatePersonalizedContent = () => {
    if (!userProfile || !patientProfile) {
      return null;
    }
    const isMale = userProfile.gender === 'Masculino';
    const hasGoal = patientProfile.goal;
    const hasAllergies = patientProfile.food_allergy;
    const hasRestrictions = patientProfile.medical_restriction;
    return {
      muscleAnalysis: [{
        group: 'Peitoral',
        level: isMale ? 'Bem desenvolvido' : 'Moderadamente desenvolvido',
        color: 'green'
      }, {
        group: 'Dorsais',
        level: 'Moderadamente desenvolvido',
        color: 'yellow'
      }, {
        group: 'Deltoides',
        level: 'Bem desenvolvido',
        color: 'green'
      }, {
        group: 'Quadríceps',
        level: isMale ? 'Pouco desenvolvido' : 'Moderadamente desenvolvido',
        color: isMale ? 'red' : 'yellow'
      }],
      nutritionPlan: {
        protein: patientProfile.weight ? (patientProfile.weight * 1.8).toFixed(1) : 'N/A',
        carbs: patientProfile.weight ? (patientProfile.weight * 4).toFixed(1) : 'N/A',
        fat: patientProfile.weight ? (patientProfile.weight * 1).toFixed(1) : 'N/A',
        restrictions: hasAllergies ? patientProfile.food_allergy : 'Nenhuma restrição específica',
        supplements: isMale ? ['Whey Protein: 30g pós-treino', 'Creatina: 3g diariamente', 'Vitamina D3: 2000 UI', 'Ômega 3: 1g diariamente'] : ['Whey Protein: 25g pós-treino', 'Colágeno: 10g diariamente', 'Vitamina D3: 2000 UI', 'Ferro: conforme necessidade']
      },
      trainingPlan: hasGoal && hasGoal.toLowerCase().includes('perda') ? 'Foco em treinos metabólicos e cardio' : 'Foco em hipertrofia e força'
    };
  };
  const personalizedContent = generatePersonalizedContent();

  // Só renderizar se estiver pago (a lógica de upgrade agora fica no ReportViewer)
  if (!isPaid) {
    return null;
  }
  return <div className="space-y-8">
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-green-800 flex items-center">
              <Crown className="w-6 h-6 mr-2 text-yellow-500" />
              Análise Premium Desbloqueada
            </CardTitle>
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ativo
            </Badge>
          </div>
        </CardHeader>
        
      </Card>
    </div>;
};
export default PremiumSection;