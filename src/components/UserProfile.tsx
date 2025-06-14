import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { getEstados, Estado } from '@/services/stateService';
import { getCidadesByEstado, Cidade } from '@/services/cityService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { DeleteProfileDialog } from "@/components/profile/DeleteProfileDialog";
import { useDeleteProfile } from "@/hooks/useDeleteProfile";
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
}

const UserProfile = ({ onBack, onLogout, onLogoClick, onProfileClick }: UserProfileProps) => {
  const { user } = useAuth();
  const { userProfile, patientProfile, loading, updateUserProfile, createOrUpdatePatientProfile } = useUserProfile();
  const { toast } = useToast();
  
  // User profile fields
  const [name, setName] = useState(userProfile?.name || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [birthDate, setBirthDate] = useState<Date | undefined>(userProfile?.birth_date ? new Date(userProfile.birth_date) : undefined);
  
  // Patient profile fields
  const [weight, setWeight] = useState(patientProfile?.weight?.toString() || '');
  const [height, setHeight] = useState(patientProfile?.height?.toString() || '');
  const [city, setCity] = useState(patientProfile?.city || '');
  const [estadoId, setEstadoId] = useState(patientProfile?.estado_id || '');
  const [goal, setGoal] = useState(patientProfile?.goal || '');
  const [chronicDisease, setChronicDisease] = useState(patientProfile?.chronic_disease || '');
  const [medicalRestriction, setMedicalRestriction] = useState(patientProfile?.medical_restriction || '');
  const [foodAllergy, setFoodAllergy] = useState(patientProfile?.food_allergy || '');
  const [avoidFood, setAvoidFood] = useState(patientProfile?.avoid_food || '');
  const [physicalActivity, setPhysicalActivity] = useState(patientProfile?.physical_activity || '');
  const [activityFrequency, setActivityFrequency] = useState(patientProfile?.activity_frequency || '');
  const [fixedMealTimes, setFixedMealTimes] = useState(patientProfile?.fixed_meal_times || '');
  const [mustHaveFood, setMustHaveFood] = useState(patientProfile?.must_have_food || '');
  const [neckCircumference, setNeckCircumference] = useState(patientProfile?.neck_circumference?.toString() || '');
  const [waistCircumference, setWaistCircumference] = useState(patientProfile?.waist_circumference?.toString() || '');
  const [hipCircumference, setHipCircumference] = useState(patientProfile?.hip_circumference?.toString() || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const { deleteProfile, loading: deleteLoading } = useDeleteProfile();
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);

  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setGender(userProfile.gender || '');
      setBirthDate(userProfile.birth_date ? new Date(userProfile.birth_date) : undefined);
    }
    
    if (patientProfile) {
      setWeight(patientProfile.weight?.toString() || '');
      setHeight(patientProfile.height?.toString() || '');
      setCity(patientProfile.city || '');
      setEstadoId(patientProfile.estado_id || '');
      setGoal(patientProfile.goal || '');
      setChronicDisease(patientProfile.chronic_disease || '');
      setMedicalRestriction(patientProfile.medical_restriction || '');
      setFoodAllergy(patientProfile.food_allergy || '');
      setAvoidFood(patientProfile.avoid_food || '');
      setPhysicalActivity(patientProfile.physical_activity || '');
      setActivityFrequency(patientProfile.activity_frequency || '');
      setFixedMealTimes(patientProfile.fixed_meal_times || '');
      setMustHaveFood(patientProfile.must_have_food || '');
      setNeckCircumference(patientProfile.neck_circumference?.toString() || '');
      setWaistCircumference(patientProfile.waist_circumference?.toString() || '');
      setHipCircumference(patientProfile.hip_circumference?.toString() || '');
    }
  }, [userProfile, patientProfile]);

  useEffect(() => {
    if (estadoId) {
      fetchCidades(estadoId);
    } else {
      setCidades([]);
      setCity('');
    }
  }, [estadoId]);

  const fetchEstados = async () => {
    try {
      const estadosData = await getEstados();
      setEstados(estadosData);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a lista de estados.",
        variant: "destructive"
      });
    } finally {
      setLoadingEstados(false);
    }
  };

  const fetchCidades = async (estadoId: string) => {
    setLoadingCidades(true);
    try {
      const estado = estados.find(e => e.id.toString() === estadoId);
      if (estado) {
        const cidadesData = await getCidadesByEstado(estado.sigla);
        setCidades(cidadesData);
      }
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a lista de cidades.",
        variant: "destructive"
      });
    } finally {
      setLoadingCidades(false);
    }
  };

  const handleEstadoChange = (value: string) => {
    setEstadoId(value);
    setCity(''); // Reset city when state changes
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    if (!user) return;

    // Update user profile
    const userUpdates = {
      name,
      gender,
      birth_date: birthDate ? birthDate.toISOString() : null
    };

    const { error: userError } = await updateUserProfile(userUpdates);

    // Update patient profile
    const patientUpdates = {
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      city: city || null,
      estado_id: estadoId || null,
      goal: goal || null,
      chronic_disease: chronicDisease || null,
      medical_restriction: medicalRestriction || null,
      food_allergy: foodAllergy || null,
      avoid_food: avoidFood || null,
      physical_activity: physicalActivity || null,
      activity_frequency: activityFrequency || null,
      fixed_meal_times: fixedMealTimes || null,
      must_have_food: mustHaveFood || null,
      neck_circumference: neckCircumference ? parseFloat(neckCircumference) : null,
      waist_circumference: waistCircumference ? parseFloat(waistCircumference) : null,
      hip_circumference: hipCircumference ? parseFloat(hipCircumference) : null
    };

    const { error: patientError } = await createOrUpdatePatientProfile(patientUpdates);

    if (userError || patientError) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar seu perfil. Tente novamente.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "Seu perfil foi atualizado com sucesso."
      });
    }

    setIsSaving(false);
  };

  const handleDeleteProfile = async () => {
    const success = await deleteProfile();
    if (success) {
      onLogout();
    } else {
      setDeleteProfileOpen(false);
    }
  };

  if (loading) {
    return (
      <LoggedPageLayout
        userName={userProfile?.name}
        onLogoClick={onLogoClick}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
      >
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            Carregando perfil...
          </div>
        </div>
      </LoggedPageLayout>
    );
  }

  return (
    <LoggedPageLayout
      userName={userProfile?.name}
      onLogoClick={onLogoClick}
      onProfileClick={onProfileClick}
      onLogout={onLogout}
    >
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Dados Pessoais</CardTitle>
              <CardDescription>
                Informações básicas do seu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={estadoId} onValueChange={handleEstadoChange} disabled={loadingEstados}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.id} value={estado.id.toString()}>
                          {estado.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Select value={city} onValueChange={setCity} disabled={!estadoId || loadingCidades}>
                    <SelectTrigger className="w-full">
                      <SelectValue 
                        placeholder={
                          !estadoId 
                            ? "Selecione primeiro o estado" 
                            : loadingCidades 
                              ? "Carregando cidades..." 
                              : "Selecione a cidade"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cidades.map((cidade) => (
                        <SelectItem key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Físicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Informações Físicas</CardTitle>
              <CardDescription>
                Medidas corporais e objetivos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 75"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ex: 175"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="neckCircumference">Circunferência do Pescoço (cm)</Label>
                  <Input
                    id="neckCircumference"
                    value={neckCircumference}
                    onChange={(e) => setNeckCircumference(e.target.value)}
                    placeholder="Ex: 38"
                  />
                </div>
                <div>
                  <Label htmlFor="waistCircumference">Circunferência da Cintura (cm)</Label>
                  <Input
                    id="waistCircumference"
                    value={waistCircumference}
                    onChange={(e) => setWaistCircumference(e.target.value)}
                    placeholder="Ex: 85"
                  />
                </div>
                <div>
                  <Label htmlFor="hipCircumference">Quadril (cm)</Label>
                  <Input
                    id="hipCircumference"
                    value={hipCircumference}
                    onChange={(e) => setHipCircumference(e.target.value)}
                    placeholder="Ex: 95"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Input
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ex: Perder peso, ganhar massa muscular..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Atividade Física */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Atividade Física</CardTitle>
              <CardDescription>
                Informações sobre suas atividades físicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="physicalActivity">Tipo de Exercício</Label>
                  <Input
                    id="physicalActivity"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                    placeholder="Ex: Musculação, corrida..."
                  />
                </div>
                <div>
                  <Label htmlFor="activityFrequency">Frequência (dias/semana)</Label>
                  <Input
                    id="activityFrequency"
                    value={activityFrequency}
                    onChange={(e) => setActivityFrequency(e.target.value)}
                    placeholder="Ex: 3-4 dias"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saúde e Restrições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Saúde e Restrições</CardTitle>
              <CardDescription>
                Informações médicas e restrições alimentares.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chronicDisease">Doenças Crônicas</Label>
                  <Input
                    id="chronicDisease"
                    value={chronicDisease}
                    onChange={(e) => setChronicDisease(e.target.value)}
                    placeholder="Ex: Diabetes, hipertensão..."
                  />
                </div>
                <div>
                  <Label htmlFor="medicalRestriction">Restrições Médicas</Label>
                  <Input
                    id="medicalRestriction"
                    value={medicalRestriction}
                    onChange={(e) => setMedicalRestriction(e.target.value)}
                    placeholder="Ex: Cirurgia, lesão..."
                  />
                </div>
                <div>
                  <Label htmlFor="foodAllergy">Alergias Alimentares</Label>
                  <Input
                    id="foodAllergy"
                    value={foodAllergy}
                    onChange={(e) => setFoodAllergy(e.target.value)}
                    placeholder="Ex: Glúten, lactose..."
                  />
                </div>
                <div>
                  <Label htmlFor="avoidFood">Alimentos a Evitar</Label>
                  <Input
                    id="avoidFood"
                    value={avoidFood}
                    onChange={(e) => setAvoidFood(e.target.value)}
                    placeholder="Ex: Frituras, açúcar..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferências Alimentares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Preferências Alimentares</CardTitle>
              <CardDescription>
                Suas preferências e horários de alimentação.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fixedMealTimes">Horários Fixos de Refeição</Label>
                  <Input
                    id="fixedMealTimes"
                    value={fixedMealTimes}
                    onChange={(e) => setFixedMealTimes(e.target.value)}
                    placeholder="Ex: 8h, 12h, 18h..."
                  />
                </div>
                <div>
                  <Label htmlFor="mustHaveFood">Alimentos Indispensáveis</Label>
                  <Input
                    id="mustHaveFood"
                    value={mustHaveFood}
                    onChange={(e) => setMustHaveFood(e.target.value)}
                    placeholder="Ex: Café, arroz..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                  {isSaving ? 'Salvando...' : 'Salvar Perfil'}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setDeleteProfileOpen(true)}
                  className="w-full"
                >
                  Excluir Perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          <DeleteProfileDialog
            open={deleteProfileOpen}
            onOpenChange={setDeleteProfileOpen}
            onConfirm={handleDeleteProfile}
            loading={deleteLoading}
          />
        </div>
      </div>
    </LoggedPageLayout>
  );
};

export default UserProfile;
