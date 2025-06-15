
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Estado, Cidade } from '@/services/stateService';

interface PersonalDataCardProps {
  name: string;
  setName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  birthDateInput: string;
  handleBirthDateInputChange: (value: string) => void;
  birthDate: Date | undefined;
  handleCalendarSelect: (date: Date | undefined) => void;
  estadoId: string;
  handleEstadoChange: (value: string) => void;
  cityId: string;
  setCityId: (value: string) => void;
  estados: Estado[];
  loadingEstados: boolean;
  cidades: Cidade[];
  loadingCidades: boolean;
}

export const PersonalDataCard = ({
  name,
  setName,
  gender,
  setGender,
  birthDateInput,
  handleBirthDateInputChange,
  birthDate,
  handleCalendarSelect,
  estadoId,
  handleEstadoChange,
  cityId,
  setCityId,
  estados,
  loadingEstados,
  cidades,
  loadingCidades
}: PersonalDataCardProps) => {
  return (
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
          <div className="flex gap-2">
            <Input
              type="text"
              value={birthDateInput}
              onChange={(e) => handleBirthDateInputChange(e.target.value)}
              placeholder="dd/mm/aaaa"
              className="flex-1"
              maxLength={10}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={handleCalendarSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
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
            <Select value={cityId} onValueChange={setCityId} disabled={!estadoId || loadingCidades}>
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
                  <SelectItem key={cidade.id} value={cidade.id.toString()}>
                    {cidade.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
