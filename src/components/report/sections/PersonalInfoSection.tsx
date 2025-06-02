
import { UserProfile, PatientProfile } from "@/types/report";

interface PersonalInfoSectionProps {
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
  displayAge: number | string;
}

const PersonalInfoSection = ({ userProfile, patientProfile, displayAge }: PersonalInfoSectionProps) => {
  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return 'N/A';
    return gender === 'Masculino' ? 'Masculino' : 'Feminino';
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
        <div>
          <span className="text-gray-600 font-medium">Nome:</span>
          <div className="text-gray-800 font-semibold text-lg">{userProfile?.name || 'N/A'}</div>
        </div>
        <div></div>
        <div>
          <span className="text-gray-600 font-medium">Idade:</span>
          <div className="text-gray-800 font-semibold text-lg">{displayAge} anos</div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Gênero:</span>
          <div className="text-gray-800 font-semibold text-lg">{formatGender(userProfile?.gender)}</div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Altura:</span>
          <div className="text-gray-800 font-semibold text-lg">
            {patientProfile?.height ? `${(patientProfile.height / 100).toFixed(2)}m` : 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Peso:</span>
          <div className="text-gray-800 font-semibold text-lg">
            {patientProfile?.weight ? `${patientProfile.weight}kg` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
