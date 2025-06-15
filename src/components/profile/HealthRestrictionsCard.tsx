
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthRestrictionsCardProps {
  chronicDisease: string;
  setChronicDisease: (value: string) => void;
  medicalRestriction: string;
  setMedicalRestriction: (value: string) => void;
  foodAllergy: string;
  setFoodAllergy: (value: string) => void;
  avoidFood: string;
  setAvoidFood: (value: string) => void;
}

export const HealthRestrictionsCard = ({
  chronicDisease,
  setChronicDisease,
  medicalRestriction,
  setMedicalRestriction,
  foodAllergy,
  setFoodAllergy,
  avoidFood,
  setAvoidFood
}: HealthRestrictionsCardProps) => {
  return (
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
  );
};
