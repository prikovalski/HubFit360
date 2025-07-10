
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import { Report, UserProfile, PatientProfile } from "@/types/report";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import EstimatesSection from "./sections/EstimatesSection";
import IdealRangesSection from "./sections/IdealRangesSection";
import AnalysisIncludedSection from "./sections/AnalysisIncludedSection";

interface BasicAnalysisSectionProps {
  report: Report & { 
    patient_name?: string | null;
    patient_goal?: string | null;
    patient_gender?: string | null;
    patient_height?: number | null;
    patient_weight?: number | null;
  };
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
  console.log('Objetivo do paciente:', report.patient_goal);

  return (
    <Card className="border-0 shadow-lg bg-white mb-6">
      <CardHeader className="bg-gradient-to-r from-[#019f80]/5 to-green-50 border-b border-green-100">
        <CardTitle className="text-2xl text-gray-800 flex items-center font-bold">
          <FileText className="w-7 h-7 mr-3 text-[#019f80]" />
          Análise Básica
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        <PersonalInfoSection 
          userProfile={userProfile}
          patientProfile={patientProfile}
          displayAge={displayAge}
          patientName={report.patient_name}
          patientGoal={report.patient_goal}
          patientGender={report.patient_gender}
          patientHeight={report.patient_height}
          patientWeight={report.patient_weight}
        />

        <EstimatesSection preview={report.preview} />

        <IdealRangesSection 
          userProfile={userProfile} 
          patientProfile={patientProfile}
          patientGender={report.patient_gender}
          patientHeight={report.patient_height}
          patientWeight={report.patient_weight}
        />

        <AnalysisIncludedSection />
      </CardContent>
    </Card>
  );
};

export default BasicAnalysisSection;
