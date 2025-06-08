import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { getEstados, Estado } from '@/services/stateService';
import { getCidadesByEstado, Cidade } from '@/services/cityService';

interface UserProfileProps {
  onBack: () => void;
}

const UserProfile = ({ onBack }: UserProfileProps) => {
  const { toast } = useToast();
  const { userProfile, patientProfile, updateUserProfile, createOrUpdatePatientProfile, refetch } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [estadosLoading, setEstadosLoading] = useState(false);
  const [cidadesLoading, setCidadesLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    weight: '',
    height: '',
    city: '',
    state: '',
    goal: '',
    chronicDisease: '',
    medicalRestriction: '',
    foodAllergy: '',
    avoidFood: '',
    physicalActivity: '',
    activityFrequency: '',
    fixedMealTimes: '',
    mustHaveFood: '',
    neckCircumference: '',
    waistCircumference: '',
    hipCircumference: ''
  });

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        gender: userProfile.gender || '',
        birthDate: userProfile.birth_date || ''
      }));
    }

    if (patientProfile) {
      setFormData(prev => ({
        ...prev,
        weight: patientProfile.weight?.toString() || '',
        height: patientProfile.height?.toString() || '',
        city: patientProfile.city || '',
        goal: patientProfile.goal || '',
        chronicDisease: patientProfile.chronic_disease || '',
        medicalRestriction: patientProfile.medical_restriction || '',
        foodAllergy: patientProfile.food_allergy || '',
        avoidFood: patientProfile.avoid_food || '',
        physicalActivity: patientProfile.physical_activity || '',
        activityFrequency: patientProfile.activity_frequency || '',
        fixedMealTimes: patientProfile.fixed_meal_times || '',
        mustHaveFood: patientProfile.must_have_food || '',
        neckCircumference: patientProfile.neck_circumference?.toString() || '',
        waistCircumference: patientProfile.waist_circumference?.toString() || '',
        hipCircumference: patientProfile.hip_circumference?.toString() || ''
      }));
    }
  }, [userProfile, patientProfile]);

  // Carregar estados
  useEffect(() => {
    setEstadosLoading(true);
    getEstados()
      .then(data => setEstados(data))
      .catch(() => setEstados([]))
      .finally(() => setEstadosLoading(false));
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (!formData.state) {
      setCidades([]);
      return;
    }
    setCidadesLoading(true);
    getCidadesByEstado(formData.state)
      .then(data => setCidades(data))
      .catch(() => setCidades([]))
      .finally(() => setCidadesLoading(false));
  }, [formData.state]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Atualizar dados básicos do usuário
      const userUpdates = {
        name: formData.name,
        gender: formData.gender,
        birth_date: formData.birthDate || null
      };

      const { error: userError } = await updateUserProfile(userUpdates);
      if (userError) throw userError;

      // Atualizar dados do perfil do paciente
      const patientUpdates = {
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        city: formData.city || null,
        goal: formData.goal || null,
        chronic_disease: formData.chronicDisease || null,
        medical_restriction: formData.medicalRestriction || null,
        food_allergy: formData.foodAllergy || null,
        avoid_food: formData.avoidFood || null,
        physical_activity: formData.physicalActivity || null,
        activity_frequency: formData.activityFrequency || null,
        fixed_meal_times: formData.fixedMealTimes || null,
        must_have_food: formData.mustHaveFood || null,
        neck_circumference: formData.neckCircumference ? parseFloat(formData.neckCircumference) : null,
        waist_circumference: formData.waistCircumference ? parseFloat(formData.waistCircumference) : null,
        hip_circumference: formData.hipCircumference ? parseFloat(formData.hipCircumference) : null
      };

      const { error: patientError } = await createOrUpdatePatientProfile(patientUpdates);
      if (patientError) throw patientError;

      await refetch();

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar suas informações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 text-[#019f80] hover:text-[#017a63] hover:bg-transparent p-0 h-auto font-normal"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#019f80] to-[#4ade80] rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
              <p className="text-gray-600">Visualize e edite suas informações pessoais</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primeira linha: Nome completo */}
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  disabled={loading}
                />
              </div>
              
              {/* Segunda linha: Gênero e Data de Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.gender}
                    onChange={e => handleInputChange('gender', e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={e => handleInputChange('birthDate', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Terceira linha: Cidade e Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <select
                    id="city"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    disabled={loading || cidadesLoading || !formData.state}
                  >
                    <option value="">{cidadesLoading ? 'Carregando...' : 'Selecione'}</option>
                    {cidades.map((cidade) => (
                      <option key={cidade.id} value={cidade.nome}>
                        {cidade.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <select
                    id="state"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.state}
                    onChange={e => handleInputChange('state', e.target.value)}
                    disabled={loading || estadosLoading}
                  >
                    <option value="">Selecione</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.sigla}>
                        {estado.nome} ({estado.sigla})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Físicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Dados Físicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primeira linha: Peso e Altura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={e => handleInputChange('weight', e.target.value)}
                    placeholder="Ex: 75"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={e => handleInputChange('height', e.target.value)}
                    placeholder="Ex: 175"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Segunda linha: Circunferências */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="neckCircumference">Circunferência do Pescoço (cm)</Label>
                  <Input
                    id="neckCircumference"
                    value={formData.neckCircumference}
                    onChange={e => handleInputChange('neckCircumference', e.target.value)}
                    placeholder="Ex: 38"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="waistCircumference">Circunferência da Cintura (cm)</Label>
                  <Input
                    id="waistCircumference"
                    value={formData.waistCircumference}
                    onChange={e => handleInputChange('waistCircumference', e.target.value)}
                    placeholder="Ex: 85"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="hipCircumference">Quadril (cm)</Label>
                  <Input
                    id="hipCircumference"
                    value={formData.hipCircumference}
                    onChange={e => handleInputChange('hipCircumference', e.target.value)}
                    placeholder="Ex: 95"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Terceira linha: Objetivo */}
              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Input
                  id="goal"
                  value={formData.goal}
                  onChange={e => handleInputChange('goal', e.target.value)}
                  placeholder="Ex: Perder peso, ganhar massa muscular..."
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Atividade Física */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Atividade Física</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="physicalActivity">Tipo de Exercício</Label>
                  <Input
                    id="physicalActivity"
                    value={formData.physicalActivity}
                    onChange={e => handleInputChange('physicalActivity', e.target.value)}
                    placeholder="Ex: Musculação"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="activityFrequency">Frequência (dias/semana)</Label>
                  <Input
                    id="activityFrequency"
                    value={formData.activityFrequency}
                    onChange={e => handleInputChange('activityFrequency', e.target.value)}
                    placeholder="Ex: 3-4 dias"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saúde e Restrições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Saúde e Restrições</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chronicDisease">Doenças Crônicas</Label>
                  <Input
                    id="chronicDisease"
                    value={formData.chronicDisease}
                    onChange={e => handleInputChange('chronicDisease', e.target.value)}
                    placeholder="Ex: Diabetes, hipertensão..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="medicalRestriction">Restrições Médicas</Label>
                  <Input
                    id="medicalRestriction"
                    value={formData.medicalRestriction}
                    onChange={e => handleInputChange('medicalRestriction', e.target.value)}
                    placeholder="Ex: Cirurgia, lesão..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="foodAllergy">Alergias Alimentares</Label>
                  <Input
                    id="foodAllergy"
                    value={formData.foodAllergy}
                    onChange={e => handleInputChange('foodAllergy', e.target.value)}
                    placeholder="Ex: Glúten, lactose..."
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="avoidFood">Alimentos a Evitar</Label>
                  <Input
                    id="avoidFood"
                    value={formData.avoidFood}
                    onChange={e => handleInputChange('avoidFood', e.target.value)}
                    placeholder="Ex: Frituras, açúcar..."
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-[#019f80] hover:bg-[#017a63] text-white px-8 py-3"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
