import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler, AlertCircle } from "lucide-react";

interface MeasurementInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MeasurementInstructionsModal = ({ 
  open, 
  onOpenChange 
}: MeasurementInstructionsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ruler className="w-6 h-6 text-primary" />
            Como Medir suas Circunferências
          </DialogTitle>
          <DialogDescription>
            Instruções detalhadas para obter medições precisas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preparação */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">Importante: Tenha uma Fita Métrica em Mãos</h3>
                <p className="text-amber-700 text-sm">
                  Para realizar as medições corretamente, você precisará de uma fita métrica flexível (trena de costureira). 
                  Não use régua rígida ou fita métrica de construção.
                </p>
              </div>
            </div>
          </div>

          {/* Preparação Geral */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Preparação Geral</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Mantenha-se em pé, relaxado, com os braços ao lado do corpo
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Use roupas justas ou faça as medições diretamente na pele
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Respire normalmente durante as medições
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Não aperte demais a fita métrica - ela deve estar firme, mas não apertada
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Se possível, peça ajuda de outra pessoa para maior precisão
              </li>
            </ul>
          </div>

          {/* Circunferência do Pescoço */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg text-blue-700">Circunferência do Pescoço</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Onde medir:</strong> Na parte mais estreita do pescoço, logo abaixo do pomo de Adão (homens) 
                ou na base do pescoço (mulheres).
              </p>
              <p className="text-sm text-blue-700">
                <strong>Como fazer:</strong> Posicione a fita métrica ao redor do pescoço, mantendo-a paralela ao chão. 
                A fita deve estar justa, mas não apertada - você deve conseguir passar um dedo entre a fita e o pescoço.
              </p>
            </div>
          </div>

          {/* Circunferência da Cintura */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg text-green-700">Circunferência da Cintura</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-3">
                <strong>Onde medir:</strong> Na linha natural da cintura, geralmente a parte mais estreita do tronco, 
                aproximadamente na altura do umbigo.
              </p>
              <p className="text-sm text-green-700">
                <strong>Como fazer:</strong> Posicione a fita métrica ao redor da cintura, mantendo-a paralela ao chão. 
                Expire normalmente e faça a medição no final da expiração. Não contraia o abdômen.
              </p>
            </div>
          </div>

          {/* Circunferência do Quadril */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg text-purple-700">Circunferência do Quadril</h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800 mb-3">
                <strong>Onde medir:</strong> Na parte mais larga dos quadris, passando pelos pontos mais salientes 
                dos glúteos.
              </p>
              <p className="text-sm text-purple-700">
                <strong>Como fazer:</strong> Posicione a fita métrica ao redor dos quadris, mantendo-a paralela ao chão. 
                Mantenha os pés juntos e distribua o peso igualmente nas duas pernas.
              </p>
            </div>
          </div>

          {/* Dicas Extras */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-lg">Dicas Importantes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                Faça as medições sempre no mesmo horário do dia para consistência
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                Repita cada medição 2-3 vezes e use a média dos valores
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                Use um espelho para verificar se a fita está na posição correta
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                Anote os valores imediatamente para não esquecer
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="px-6">
            Entendi, Vamos Começar!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};