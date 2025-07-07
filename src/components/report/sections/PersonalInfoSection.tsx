
import { UserProfile, PatientProfile } from "@/types/report";
import { mapGenderFromDB } from "@/utils/genderMapping";

interface PersonalInfoSectionProps {
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
  displayAge: number | string;
  patientName?: string | null;
  patientGoal?: string | null;
}

const PersonalInfoSection = ({ 
  userProfile, 
  patientProfile, 
  displayAge, 
  patientName,
  patientGoal
}: PersonalInfoSectionProps) => {
  // Determinar qual nome usar (priorizar patientName se existir)
  const displayName = patientName || userProfile?.name || 'Não informado';
  
  // Determinar qual objetivo usar (priorizar patientGoal se existir)
  const displayGoal = patientGoal || patientProfile?.goal;

  // Mapear o gênero para português
  const displayGender = mapGenderFromDB(userProfile?.gender);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Dados Pessoais
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Nome:</span>
          <span className="ml-2 text-gray-800">{displayName}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Idade:</span>
          <span className="ml-2 text-gray-800">{displayAge} anos</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Gênero:</span>
          <span className="ml-2 text-gray-800">{displayGender || 'Não informado'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Altura:</span>
          <span className="ml-2 text-gray-800">
            {patientProfile?.height ? `${(patientProfile.height / 100).toFixed(2)}m` : 'Não informado'}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Peso:</span>
          <span className="ml-2 text-gray-800">
            {patientProfile?.weight ? `${patientProfile.weight}kg` : 'Não informado'}
          </span>
        </div>
        {displayGoal && (
          <div>
            <span className="font-medium text-gray-600">Objetivo:</span>
            <span className="ml-2 text-gray-800">{displayGoal}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
