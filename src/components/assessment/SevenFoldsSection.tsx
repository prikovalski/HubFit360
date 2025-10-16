
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface SevenFoldsSectionProps {
  chestFold: string;
  midaxillaryFold: string;
  tricepsFold: string;
  subscapularFold: string;
  abdominalFold: string;
  suprailiacFold: string;
  thighFold: string;
  onChestFoldChange: (value: string) => void;
  onMidaxillaryFoldChange: (value: string) => void;
  onTricepsFoldChange: (value: string) => void;
  onSubscapularFoldChange: (value: string) => void;
  onAbdominalFoldChange: (value: string) => void;
  onSuprailiacFoldChange: (value: string) => void;
  onThighFoldChange: (value: string) => void;
  onShowInstructions: () => void;
}

export const SevenFoldsSection = ({
  chestFold,
  midaxillaryFold,
  tricepsFold,
  subscapularFold,
  abdominalFold,
  suprailiacFold,
  thighFold,
  onChestFoldChange,
  onMidaxillaryFoldChange,
  onTricepsFoldChange,
  onSubscapularFoldChange,
  onAbdominalFoldChange,
  onSuprailiacFoldChange,
  onThighFoldChange,
  onShowInstructions
}: SevenFoldsSectionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Medidas das 7 Dobras Cutâneas</CardTitle>
            <CardDescription>
              Todas as medidas devem ser em milímetros (mm)
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowInstructions}
          >
            <Info className="h-4 w-4 mr-2" />
            Como Medir
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="chestFold">Peitoral (mm) *</Label>
            <Input
              id="chestFold"
              type="number"
              step="0.1"
              value={chestFold}
              onChange={(e) => onChestFoldChange(e.target.value)}
              placeholder="Ex: 12.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Diagonal entre axila e mamilo
            </p>
          </div>

          <div>
            <Label htmlFor="midaxillaryFold">Axilar Média (mm) *</Label>
            <Input
              id="midaxillaryFold"
              type="number"
              step="0.1"
              value={midaxillaryFold}
              onChange={(e) => onMidaxillaryFoldChange(e.target.value)}
              placeholder="Ex: 15.0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Horizontal na linha axilar média
            </p>
          </div>

          <div>
            <Label htmlFor="tricepsFold">Tríceps (mm) *</Label>
            <Input
              id="tricepsFold"
              type="number"
              step="0.1"
              value={tricepsFold}
              onChange={(e) => onTricepsFoldChange(e.target.value)}
              placeholder="Ex: 18.0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Vertical na parte posterior do braço
            </p>
          </div>

          <div>
            <Label htmlFor="subscapularFold">Subescapular (mm) *</Label>
            <Input
              id="subscapularFold"
              type="number"
              step="0.1"
              value={subscapularFold}
              onChange={(e) => onSubscapularFoldChange(e.target.value)}
              placeholder="Ex: 16.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Diagonal abaixo da escápula
            </p>
          </div>

          <div>
            <Label htmlFor="abdominalFold">Abdominal (mm) *</Label>
            <Input
              id="abdominalFold"
              type="number"
              step="0.1"
              value={abdominalFold}
              onChange={(e) => onAbdominalFoldChange(e.target.value)}
              placeholder="Ex: 24.0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Vertical ao lado do umbigo
            </p>
          </div>

          <div>
            <Label htmlFor="suprailiacFold">Supra-ilíaca (mm) *</Label>
            <Input
              id="suprailiacFold"
              type="number"
              step="0.1"
              value={suprailiacFold}
              onChange={(e) => onSuprailiacFoldChange(e.target.value)}
              placeholder="Ex: 20.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Diagonal acima da crista ilíaca
            </p>
          </div>

          <div>
            <Label htmlFor="thighFold">Coxa (mm) *</Label>
            <Input
              id="thighFold"
              type="number"
              step="0.1"
              value={thighFold}
              onChange={(e) => onThighFoldChange(e.target.value)}
              placeholder="Ex: 22.0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Vertical na parte anterior da coxa
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
