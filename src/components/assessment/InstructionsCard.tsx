
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from 'lucide-react';

const InstructionsCard = () => (
  <Card className="mb-8 bg-blue-50 border-blue-200">
    <CardHeader>
      <CardTitle className="flex items-center text-blue-800">
        <Camera className="w-5 h-5 mr-2" />
        Instruções para as fotos
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 text-blue-700">
        <li>• Use roupas justas ou traje de banho para melhor análise</li>
        <li>• Mantenha postura ereta e natural</li>
        <li>• Certifique-se de que há boa iluminação</li>
        <li>• Tire as fotos contra uma parede lisa e clara</li>
        <li>• Mantenha distância de aproximadamente 2 metros da câmera</li>
      </ul>
    </CardContent>
  </Card>
);

export default InstructionsCard;
