
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, User, Activity, Heart, AlertTriangle } from "lucide-react";

const AssessmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Dados pessoais
    gender: "masculino",
    weight: "75",
    height: "175",
    neckCircumference: "38",
    waistCircumference: "85",
    hipCircumference: "95",
    
    // Atividade física
    exerciseFrequency: "3-4",
    exerciseType: "musculacao",
    exerciseIntensity: "moderada",
    
    // Restrições e alergias
    dietaryRestrictions: "vegetariano",
    allergies: "lactose",
    medications: "whey protein, creatina",
    preExistingConditions: "hipertensao",
    
    // Hábitos alimentares
    mealsPerDay: "5",
    waterIntake: "2-3",
    sleepHours: "7-8",
    stressLevel: "moderado"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados da avaliação:", formData);
    // Aqui seria enviado para o backend
    
    // Redireciona para o dashboard após o envio
    navigate('/DashboardStats');
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Avaliação Nutricional Completa
            </h1>
            <p className="text-xl text-gray-600">
              Preencha os dados abaixo para criarmos seu plano personalizado
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados Pessoais */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-xl">
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-800">Dados Pessoais</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Ex: 75"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Ex: 175"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Circunferência do Pescoço (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.neckCircumference}
                    onChange={(e) => handleInputChange("neckCircumference", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Ex: 38"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Circunferência da Cintura (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.waistCircumference}
                    onChange={(e) => handleInputChange("waistCircumference", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Ex: 85"
                  />
                </div>
                
                {formData.gender === "feminino" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Circunferência do Quadril (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.hipCircumference}
                      onChange={(e) => handleInputChange("hipCircumference", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      placeholder="Ex: 95"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Atividade Física */}
            <div className="bg-gradient-to-r from-green-50 to-gray-50 p-6 rounded-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Atividade Física</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência de Exercícios (dias/semana)
                  </label>
                  <select
                    value={formData.exerciseFrequency}
                    onChange={(e) => handleInputChange("exerciseFrequency", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="sedentario">Sedentário</option>
                    <option value="1-2">1-2 dias</option>
                    <option value="3-4">3-4 dias</option>
                    <option value="5-6">5-6 dias</option>
                    <option value="diario">Diário</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Exercício
                  </label>
                  <select
                    value={formData.exerciseType}
                    onChange={(e) => handleInputChange("exerciseType", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="musculacao">Musculação</option>
                    <option value="cardio">Cardio</option>
                    <option value="funcional">Funcional</option>
                    <option value="crossfit">CrossFit</option>
                    <option value="natacao">Natação</option>
                    <option value="corrida">Corrida</option>
                    <option value="misto">Misto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensidade
                  </label>
                  <select
                    value={formData.exerciseIntensity}
                    onChange={(e) => handleInputChange("exerciseIntensity", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="intensa">Intensa</option>
                    <option value="muito-intensa">Muito Intensa</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Saúde e Restrições */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Heart className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-800">Saúde e Restrições</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrições Alimentares
                  </label>
                  <select
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="nenhuma">Nenhuma</option>
                    <option value="vegetariano">Vegetariano</option>
                    <option value="vegano">Vegano</option>
                    <option value="low-carb">Low Carb</option>
                    <option value="cetogenica">Cetogênica</option>
                    <option value="sem-gluten">Sem Glúten</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alergias Alimentares
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: lactose, amendoim, glúten"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicações/Suplementos
                  </label>
                  <input
                    type="text"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: whey protein, creatina"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condições Pré-existentes
                  </label>
                  <input
                    type="text"
                    value={formData.preExistingConditions}
                    onChange={(e) => handleInputChange("preExistingConditions", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: diabetes, hipertensão"
                  />
                </div>
              </div>
            </div>
            
            {/* Hábitos Alimentares */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <div className="flex items-center space-x-2 mb-6">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Hábitos de Vida</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refeições por Dia
                  </label>
                  <select
                    value={formData.mealsPerDay}
                    onChange={(e) => handleInputChange("mealsPerDay", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="3">3 refeições</option>
                    <option value="4">4 refeições</option>
                    <option value="5">5 refeições</option>
                    <option value="6">6 refeições</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consumo de Água (L/dia)
                  </label>
                  <select
                    value={formData.waterIntake}
                    onChange={(e) => handleInputChange("waterIntake", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="menos-1">Menos de 1L</option>
                    <option value="1-2">1-2L</option>
                    <option value="2-3">2-3L</option>
                    <option value="mais-3">Mais de 3L</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas de Sono
                  </label>
                  <select
                    value={formData.sleepHours}
                    onChange={(e) => handleInputChange("sleepHours", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="menos-6">Menos de 6h</option>
                    <option value="6-7">6-7h</option>
                    <option value="7-8">7-8h</option>
                    <option value="mais-8">Mais de 8h</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Estresse
                  </label>
                  <select
                    value={formData.stressLevel}
                    onChange={(e) => handleInputChange("stressLevel", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="baixo">Baixo</option>
                    <option value="moderado">Moderado</option>
                    <option value="alto">Alto</option>
                    <option value="muito-alto">Muito Alto</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-gray-600 to-green-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <Save className="w-5 h-5" />
                <span>Finalizar Avaliação</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
