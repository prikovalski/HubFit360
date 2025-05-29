
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { generateAssessmentPDF } from '@/utils/pdfGenerator';

interface ReportHeaderProps {
  report: any;
  onBack: () => void;
  isPaid: boolean;
}

const ReportHeader = ({ report, onBack, isPaid }: ReportHeaderProps) => {
  const generatePDF = () => {
    try {
      const doc = generateAssessmentPDF(report);
      const fileName = `avaliacao-hubfit360-${new Date(report.date).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "Seu laudo foi baixado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Button 
          onClick={onBack}
          variant="ghost" 
          className="mr-4 text-[#019f80] hover:bg-[#019f80]/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laudo de Avaliação Física</h1>
          <p className="text-gray-600">
            {new Date(report.date).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Badge 
          variant={isPaid ? 'default' : 'secondary'}
          className={isPaid ? 'bg-[#019f80] hover:bg-[#017a63]' : ''}
        >
          {isPaid ? 'Laudo Completo' : 'Versão Gratuita'}
        </Badge>
        
        <Button 
          onClick={generatePDF}
          variant="outline" 
          className="border-[#019f80] text-[#019f80] hover:bg-[#019f80] hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar PDF
        </Button>
      </div>
    </div>
  );
};

export default ReportHeader;
