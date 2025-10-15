import jsPDF from 'jspdf';

interface GenerateBigFivePDFProps {
  assessment: any;
}

export const generateBigFivePDF = ({ assessment }: GenerateBigFivePDFProps): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addText = (text: string, fontSize: number, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    const lineHeight = fontSize * 0.5;
    
    lines.forEach((line: string) => {
      addPageIfNeeded(lineHeight);
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
  };

  const addSection = (title: string) => {
    addPageIfNeeded(15);
    yPos += 5;
    doc.setFillColor(128, 0, 128);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 0.5, 'F');
    yPos += 5;
    addText(title, 14, true);
    yPos += 3;
  };

  const addScoreBar = (label: string, score: number, maxScore: number, color: number[]) => {
    addPageIfNeeded(20);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}/${maxScore}`, pageWidth - margin - 20, yPos);
    
    yPos += 5;
    
    const barWidth = pageWidth - 2 * margin;
    const barHeight = 6;
    
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPos, barWidth, barHeight, 'F');
    
    const fillWidth = (score / maxScore) * barWidth;
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, yPos, fillWidth, barHeight, 'F');
    
    yPos += barHeight + 8;
  };

  // Header
  doc.setFillColor(128, 0, 128);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE PERSONALIDADE', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Teste Big Five (OCEAN)', pageWidth / 2, 30, { align: 'center' });
  
  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Patient Info
  addSection('Informações do Paciente');
  
  const patientName = assessment.patient_name || 'Autoavaliação';
  addText(`Nome: ${patientName}`, 11);
  
  if (assessment.patient_gender) {
    const genderMap: Record<string, string> = {
      'MALE': 'Masculino',
      'FEMALE': 'Feminino',
      'OTHER': 'Outro'
    };
    addText(`Gênero: ${genderMap[assessment.patient_gender] || assessment.patient_gender}`, 11);
  }
  
  if (assessment.patient_age) {
    addText(`Idade: ${assessment.patient_age} anos`, 11);
  }
  
  addText(`Data da Avaliação: ${new Date(assessment.created_at).toLocaleDateString('pt-BR')}`, 11);
  
  yPos += 5;

  // Scores
  addSection('Resultados dos Cinco Grandes Fatores');
  
  const scores = assessment.scores || {};
  
  addScoreBar('Abertura a Experiências (Openness)', scores.openness || 0, 50, [128, 0, 128]);
  addScoreBar('Conscienciosidade (Conscientiousness)', scores.conscientiousness || 0, 50, [0, 0, 255]);
  addScoreBar('Extroversão (Extraversion)', scores.extraversion || 0, 50, [0, 128, 0]);
  addScoreBar('Amabilidade (Agreeableness)', scores.agreeableness || 0, 50, [255, 165, 0]);
  addScoreBar('Neuroticismo (Neuroticism)', scores.neuroticism || 0, 50, [255, 0, 0]);

  // Full Report
  if (assessment.full_report) {
    addSection('Análise da Personalidade');
    
    const reportLines = assessment.full_report.split('\n');
    
    reportLines.forEach((line: string) => {
      if (line.trim().startsWith('#')) {
        yPos += 3;
        const title = line.replace(/^#+\s*/, '');
        addText(title, 12, true);
        yPos += 2;
      } else if (line.trim()) {
        addText(line, 10);
      } else {
        yPos += 3;
      }
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
};
