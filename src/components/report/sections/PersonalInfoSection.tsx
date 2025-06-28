
import { UserProfile, PatientProfile } from "@/types/report";

interface PersonalInfoSectionProps {
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
  displayAge: number | string;
  patientName?: string | null;
}

const PersonalInfoSection = ({ 
  userProfile, 
  patientProfile, 
  displayAge, 
  patientName 
}: PersonalInfoSectionProps) => {
  // Determinar qual nome usar (priorizar patientName se existir)
  const displayName = patientName || userProfile?.name || 'Não informado';

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
          <span className="ml-2 text-gray-800">{userProfile?.gender || 'Não informado'}</span>
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
        {patientProfile?.goal && (
          <div>
            <span className="font-medium text-gray-600">Objetivo:</span>
            <span className="ml-2 text-gray-800">{patientProfile.goal}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
