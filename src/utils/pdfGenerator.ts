
import jsPDF from 'jspdf';

export const generateAssessmentPDF = (report: any) => {
  const doc = new jsPDF();
  
  // Configurações básicas
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let currentY = margin;

  // Função para adicionar texto com quebra de linha
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    textLines.forEach((line: string) => {
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });
    currentY += 3; // Espaço extra após o texto
  };

  // Cabeçalho
  addText('HUBFIT360', 20, true);
  addText('Laudo de Avaliação Física', 16, true);
  addText(`Data: ${new Date(report.date).toLocaleDateString('pt-BR')}`, 12);
  currentY += 10;

  // Dados Pessoais
  addText('DADOS PESSOAIS', 14, true);
  addText('Nome: João Silva Santos');
  addText('Idade: 32 anos');
  addText('Gênero: Masculino');
  addText('Altura: 1,78m');
  addText('Peso: 82kg');
  currentY += 10;

  // Resultados
  addText('RESULTADOS DA AVALIAÇÃO', 14, true);
  addText(`Massa Magra: ${report.preview.leanMass}`);
  addText(`Gordura Corporal: ${report.preview.bodyFat}`);
  addText(`IMC: ${report.preview.bmi}`);
  currentY += 10;

  // Análise Visual
  addText('ANÁLISE VISUAL E COMPOSIÇÃO CORPORAL', 14, true);
  addText('A análise visual demonstra uma composição corporal equilibrada, com distribuição homogênea da massa muscular nos principais grupos musculares. O percentual de gordura corporal atual encontra-se dentro da faixa considerada saudável para homens da faixa etária, apresentando leve acúmulo na região abdominal inferior, padrão típico masculino.');
  
  addText('A definição muscular é visível especialmente na região do peitoral e braços, indicando bom condicionamento físico e prática regular de exercícios resistidos. Em relação às proporções corporais, observa-se simetria adequada entre membros superiores e inferiores, com desenvolvimento muscular proporcional.');
  currentY += 10;

  // Valores Ideais
  addText('VALORES IDEAIS', 14, true);
  addText('Massa Gorda Ideal: 12-15%');
  addText('Massa Magra Ideal: 68-72kg');
  addText('IMC Ideal: 22-25');
  currentY += 10;

  // Recomendações (apenas se for versão paga)
  if (report.status === 'paid') {
    addText('RECOMENDAÇÕES PERSONALIZADAS', 14, true);
    
    addText('Programa de Treino:', 12, true);
    addText('• 4-5x por semana de musculação');
    addText('• Foco em exercícios compostos');
    addText('• 2-3x cardio moderado');
    addText('• Ênfase em core e estabilização');
    currentY += 5;
    
    addText('Plano Nutricional:', 12, true);
    addText('• 2200-2400 kcal/dia');
    addText('• 2.2g proteína/kg peso');
    addText('• 40% carbo, 30% prot, 30% gord');
    addText('• 6 refeições ao dia');
    currentY += 10;
  }

  // Rodapé
  currentY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Este laudo foi gerado pela HubFit360 - Avaliação Física com IA', margin, currentY);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, currentY + 7);

  return doc;
};
