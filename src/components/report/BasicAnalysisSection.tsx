
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import { Report, UserProfile, PatientProfile } from "@/types/report";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import EstimatesSection from "./sections/EstimatesSection";
import IdealRangesSection from "./sections/IdealRangesSection";
import AIAnalysisSection from "./sections/AIAnalysisSection";
import AnalysisIncludedSection from "./sections/AnalysisIncludedSection";

interface BasicAnalysisSectionProps {
  report: Report;
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
}

const BasicAnalysisSection = ({ report, userProfile, patientProfile }: BasicAnalysisSectionProps) => {
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Usar a idade salva na avaliação se disponível, senão calcular a partir da data de nascimento
  const displayAge = report.age || calculateAge(userProfile?.birth_date || null);

  console.log('Dados do report na BasicAnalysisSection:', report);
  console.log('Texto da avaliação:', report.assessmentText);

  return (
    <Card className="border-0 shadow-lg bg-white mb-6">
      <CardHeader className="bg-gradient-to-r from-[#019f80]/5 to-green-50 border-b border-green-100">
        <CardTitle className="text-2xl text-gray-800 flex items-center font-bold">
          <FileText className="w-7 h-7 mr-3 text-[#019f80]" />
          Laudo Técnico
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        <PersonalInfoSection 
          userProfile={userProfile}
          patientProfile={patientProfile}
          displayAge={displayAge}
        />

        <EstimatesSection preview={report.preview} />

        <IdealRangesSection userProfile={userProfile} />

        <AIAnalysisSection report={report} userProfile={userProfile} />

        <AnalysisIncludedSection />
      </CardContent>
    </Card>
  );
};

export default BasicAnalysisSection;
