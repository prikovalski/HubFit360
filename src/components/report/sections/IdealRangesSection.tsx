
import { UserProfile, PatientProfile } from "@/types/report";

interface IdealRangesSectionProps {
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
}

const IdealRangesSection = ({ userProfile, patientProfile }: IdealRangesSectionProps) => {
  // Calcular faixas ideais baseadas nos dados reais do usuário
  const calculateIdealLeanMass = () => {
    if (!patientProfile?.height || !patientProfile?.weight) {
      return "N/A";
    }
    
    const heightInM = patientProfile.height / 100;
    const baseWeight = heightInM * heightInM * 22; // IMC ideal de 22
    const idealLeanMass = baseWeight * 0.85; // 85% do peso ideal como massa magra
    
    return `${(idealLeanMass - 2).toFixed(0)}-${(idealLeanMass + 2).toFixed(0)}kg`;
  };

  const getIdealBodyFatRange = () => {
    if (!userProfile?.gender) {
      return "N/A";
    }
    
    if (userProfile.gender === 'Masculino') {
      return '10-15%';
    } else {
      return '16-24%';
    }
  };

  const calculateIdealBMI = () => {
    return "20.0-24.9";
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Faixas Ideais:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <span className="text-gray-600 font-medium">Gordura Corporal Ideal:</span>
          <div className="text-[#019f80] font-semibold text-lg">
            {getIdealBodyFatRange()}
          </div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Massa Magra Ideal:</span>
          <div className="text-[#019f80] font-semibold text-lg">
            {calculateIdealLeanMass()}
          </div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">IMC Ideal:</span>
          <div className="text-[#019f80] font-semibold text-lg">
            {calculateIdealBMI()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdealRangesSection;
