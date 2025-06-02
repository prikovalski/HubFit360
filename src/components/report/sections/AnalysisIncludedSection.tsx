
const AnalysisIncludedSection = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8">
      <h4 className="font-bold text-green-800 mb-6 flex items-center text-xl">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
          <span className="text-green-600 text-lg">✅</span>
        </div>
        Análise Básica Incluída
      </h4>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-green-700 font-medium">Percentual de massa magra e massa gorda</span>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-green-700 font-medium">Cálculo preciso do IMC</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-green-700 font-medium">Classificação da composição corporal</span>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <span className="text-green-700 font-medium">Análise personalizada gerada por IA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisIncludedSection;
