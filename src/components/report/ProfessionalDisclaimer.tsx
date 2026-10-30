import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProfessionalDisclaimer = () => (
  <Card className="border-yellow-500/20 bg-yellow-500/5">
    <CardHeader>
      <CardTitle className="text-yellow-700">Aviso Importante</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      <p>
        Esta análise é gerada por IA e não substitui a avaliação de um profissional qualificado.
      </p>
    </CardContent>
  </Card>
);

export default ProfessionalDisclaimer;
