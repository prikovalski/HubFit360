
import { ReportPreview } from "@/types/report";

interface EstimatesSectionProps {
  preview: ReportPreview;
}

const EstimatesSection = ({ preview }: EstimatesSectionProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Estimativas:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <span className="text-gray-600 font-medium">Massa Gorda:</span>
          <div className="text-gray-800 font-semibold text-lg">{preview.bodyFat}</div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">Massa Magra:</span>
          <div className="text-gray-800 font-semibold text-lg">{preview.leanMass}</div>
        </div>
        <div>
          <span className="text-gray-600 font-medium">IMC:</span>
          <div className="text-gray-800 font-semibold text-lg">{preview.bmi}</div>
        </div>
        {preview.fatMass && (
          <div>
            <span className="text-gray-600 font-medium">Massa de Gordura:</span>
            <div className="text-gray-800 font-semibold text-lg">{preview.fatMass}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimatesSection;
