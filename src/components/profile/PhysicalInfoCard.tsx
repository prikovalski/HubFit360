
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PhysicalInfoCardProps {
  weight: string;
  setWeight: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  neckCircumference: string;
  setNeckCircumference: (value: string) => void;
  waistCircumference: string;
  setWaistCircumference: (value: string) => void;
  hipCircumference: string;
  setHipCircumference: (value: string) => void;
  goal: string;
  setGoal: (value: string) => void;
}

export const PhysicalInfoCard = ({
  weight,
  setWeight,
  height,
  setHeight,
  neckCircumference,
  setNeckCircumference,
  waistCircumference,
  setWaistCircumference,
  hipCircumference,
  setHipCircumference,
  goal,
  setGoal
}: PhysicalInfoCardProps) => {
  return (
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
  );
};
