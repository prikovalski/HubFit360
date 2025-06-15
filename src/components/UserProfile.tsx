import { useState } from 'react';
import { useDeleteProfile } from '@/hooks/useDeleteProfile';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { DeleteProfileDialog } from "@/components/profile/DeleteProfileDialog";
import LoggedPageLayout from '@/components/layout/LoggedPageLayout';
import { PhysicalActivitiesSection } from '@/components/PhysicalActivitiesSection';
import { PersonalDataCard } from '@/components/profile/PersonalDataCard';
import { PhysicalInfoCard } from '@/components/profile/PhysicalInfoCard';
import { HealthRestrictionsCard } from '@/components/profile/HealthRestrictionsCard';
import { FoodPreferencesCard } from '@/components/profile/FoodPreferencesCard';
import { useProfileData } from '@/hooks/useProfileData';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
}

const UserProfile = ({ onBack, onLogout, onLogoClick, onProfileClick }: UserProfileProps) => {
  const {
    // User profile state
    name, setName,
    gender, setGender,
    birthDate,
    birthDateInput,
    handleBirthDateInputChange,
    handleCalendarSelect,
    
    // Patient profile state
    weight, setWeight,
    height, setHeight,
    cityId, setCityId,
    estadoId,
    handleEstadoChange,
    goal, setGoal,
    chronicDisease, setChronicDisease,
    medicalRestriction, setMedicalRestriction,
    foodAllergy, setFoodAllergy,
    avoidFood, setAvoidFood,
    fixedMealTimes, setFixedMealTimes,
    mustHaveFood, setMustHaveFood,
    neckCircumference, setNeckCircumference,
    waistCircumference, setWaistCircumference,
    hipCircumference, setHipCircumference,
    physicalActivities, setPhysicalActivities,
    
    // Location data
    estados,
    loadingEstados,
    cidades,
    loadingCidades,
    
    // Actions
    handleSaveProfile,
    isSaving,
    loading,
    userProfile
  } = useProfileData();

  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const { deleteProfile, loading: deleteLoading } = useDeleteProfile();

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
          
          {/* Botão de voltar */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-[#01a280] hover:text-[#01a280] hover:bg-transparent p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          </div>
          
          {/* Dados Pessoais */}
          <PersonalDataCard
            name={name}
            setName={setName}
            gender={gender}
            setGender={setGender}
            birthDateInput={birthDateInput}
            handleBirthDateInputChange={handleBirthDateInputChange}
            birthDate={birthDate}
            handleCalendarSelect={handleCalendarSelect}
            estadoId={estadoId}
            handleEstadoChange={handleEstadoChange}
            cityId={cityId}
            setCityId={setCityId}
            estados={estados}
            loadingEstados={loadingEstados}
            cidades={cidades}
            loadingCidades={loadingCidades}
          />

          {/* Informações Físicas */}
          <PhysicalInfoCard
            weight={weight}
            setWeight={setWeight}
            height={height}
            setHeight={setHeight}
            neckCircumference={neckCircumference}
            setNeckCircumference={setNeckCircumference}
            waistCircumference={waistCircumference}
            setWaistCircumference={setWaistCircumference}
            hipCircumference={hipCircumference}
            setHipCircumference={setHipCircumference}
            goal={goal}
            setGoal={setGoal}
          />

          {/* Atividade Física */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Atividade Física</CardTitle>
              <CardDescription>
                Informações sobre suas atividades físicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <PhysicalActivitiesSection
                activities={physicalActivities}
                onChange={setPhysicalActivities}
                disabled={isSaving}
              />
            </CardContent>
          </Card>

          {/* Saúde e Restrições */}
          <HealthRestrictionsCard
            chronicDisease={chronicDisease}
            setChronicDisease={setChronicDisease}
            medicalRestriction={medicalRestriction}
            setMedicalRestriction={setMedicalRestriction}
            foodAllergy={foodAllergy}
            setFoodAllergy={setFoodAllergy}
            avoidFood={avoidFood}
            setAvoidFood={setAvoidFood}
          />

          {/* Preferências Alimentares */}
          <FoodPreferencesCard
            fixedMealTimes={fixedMealTimes}
            setFixedMealTimes={setFixedMealTimes}
            mustHaveFood={mustHaveFood}
            setMustHaveFood={setMustHaveFood}
          />

          {/* Botões de Ação */}
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
