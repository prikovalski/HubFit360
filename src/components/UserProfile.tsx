import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  const { userProfile, loading, updateUserProfile } = useUserProfile();
  const { toast } = useToast();
  const [name, setName] = useState(userProfile?.name || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [birthDate, setBirthDate] = useState<Date | undefined>(userProfile?.birth_date ? new Date(userProfile.birth_date) : undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const { deleteProfile, loading: deleteLoading } = useDeleteProfile();

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setGender(userProfile.gender || '');
      setBirthDate(userProfile.birth_date ? new Date(userProfile.birth_date) : undefined);
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    if (!user) return;

    const updates = {
      name,
      gender,
      birth_date: birthDate ? birthDate.toISOString() : null
    };

    const { error } = await updateUserProfile(updates);

    if (error) {
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
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais.
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
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
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
