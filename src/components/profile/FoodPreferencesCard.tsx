
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FoodPreferencesCardProps {
  fixedMealTimes: string;
  setFixedMealTimes: (value: string) => void;
  mustHaveFood: string;
  setMustHaveFood: (value: string) => void;
}

export const FoodPreferencesCard = ({
  fixedMealTimes,
  setFixedMealTimes,
  mustHaveFood,
  setMustHaveFood
}: FoodPreferencesCardProps) => {
  return (
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
  );
};
