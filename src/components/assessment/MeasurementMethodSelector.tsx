
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MeasurementMethodSelectorProps {
  method: 'navy' | 'pollock_7';
  onMethodChange: (method: 'navy' | 'pollock_7') => void;
}

export const MeasurementMethodSelector = ({ method, onMethodChange }: MeasurementMethodSelectorProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Método de Medição</CardTitle>
        <CardDescription>
          Escolha o método de avaliação da composição corporal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={method} onValueChange={(value) => onMethodChange(value as 'navy' | 'pollock_7')}>
          <div className="flex items-start space-x-3 mb-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="navy" id="navy" />
            <div className="flex-1">
              <Label htmlFor="navy" className="cursor-pointer font-semibold">
                Método Navy (Circunferências)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Utiliza medidas de circunferência do pescoço, cintura e quadril. Mais acessível e não requer adipômetro.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
            <RadioGroupItem value="pollock_7" id="pollock_7" />
            <div className="flex-1">
              <Label htmlFor="pollock_7" className="cursor-pointer font-semibold">
                Método Pollock 7 Dobras
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Utiliza 7 dobras cutâneas com adipômetro. Método mais preciso, usado por profissionais de saúde.
              </p>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
