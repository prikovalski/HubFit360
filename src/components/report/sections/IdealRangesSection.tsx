
import { UserProfile } from "@/types/report";

interface IdealRangesSectionProps {
  userProfile: UserProfile | null;
}

const IdealRangesSection = ({ userProfile }: IdealRangesSectionProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Ideais:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <span className="text-gray-600 font-medium">Massa Gorda Ideal:</span>
          <div className="text-[#019f80] font-semibold text-lg">
            {userProfile?.gender === 'Masculino' ? '12-15%' : '16-24%'}
          </div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Massa Magra Ideal:</span>
          <div className="text-[#019f80] font-semibold text-lg">68-72kg</div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">IMC Ideal:</span>
          <div className="text-[#019f80] font-semibold text-lg">22-25</div>
        </div>
      </div>
    </div>
  );
};

export default IdealRangesSection;
