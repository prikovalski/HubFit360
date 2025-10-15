import jsPDF from 'jspdf';

interface TDAHReportData {
  id: string;
  patient_name?: string;
  patient_gender?: string;
  patient_age?: number;
  assessment_method?: string;
  responses: any;
  score?: number;
  classification?: string;
  recommendations?: string;
  full_report?: string;
  is_premium: boolean;
  created_at: string;
}

interface GenerateTDAHPDFProps {
  report: TDAHReportData;
}

export const generateTDAHAssessmentPDF = ({ report }: GenerateTDAHPDFProps) => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let currentY = margin;

  // Cores do tema (RGB)
  const primaryColor = [99, 102, 241] as [number, number, number];
  const secondaryColor = [79, 70, 229] as [number, number, number];
  const lightGray = [243, 244, 246] as [number, number, number];
  const darkGray = [55, 65, 81] as [number, number, number];
  const successColor = [34, 197, 94] as [number, number, number];
  const warningColor = [234, 179, 8] as [number, number, number];
  const dangerColor = [239, 68, 68] as [number, number, number];

  let pageNumber = 1;

  const addHeader = () => {
    // Background do cabeçalho
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo/Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('HUBFIT360', margin, 20);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Relatorio de Avaliacao TDAH', margin, 32);
    
    // Data
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date(report.created_at).toLocaleDateString('pt-BR')}`, margin, 42);
    
    currentY = 60;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  };

  const addPageNumber = () => {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, 'normal');
    doc.text(`Pagina ${pageNumber}`, pageWidth - margin - 20, pageHeight - 10);
    pageNumber++;
  };

  const addText = (
    text: string, 
    fontSize: number = 11, 
    isBold: boolean = false, 
    color: [number, number, number] = darkGray
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    textLines.forEach((line: string) => {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        addPageNumber();
        currentY = margin;
      }
      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });
    currentY += 2;
  };

  const addSection = (title: string, icon?: string) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      addPageNumber();
      currentY = margin;
    }
    
    currentY += 8;
    
    // Linha decorativa
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + 15, currentY);
    
    currentY += 2;
    
    // Título da seção
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text((icon ? icon + ' ' : '') + title, margin, currentY);
    
    currentY += 8;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont(undefined, 'normal');
  };

  const addInfoBox = (
    label: string, 
    value: string, 
    color: [number, number, number] = lightGray
  ) => {
    const boxHeight = 12;
    
    if (currentY > pageHeight - 50) {
      doc.addPage();
      addPageNumber();
      currentY = margin;
    }
    
    // Background da caixa
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, currentY - 8, pageWidth - 2 * margin, boxHeight, 2, 2, 'F');
    
    // Label
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(label + ':', margin + 3, currentY - 2);
    
    // Value
    doc.setFont(undefined, 'normal');
    doc.text(value, margin + 3 + doc.getTextWidth(label + ': '), currentY - 2);
    
    currentY += boxHeight - 4;
  };

  const addScoreBox = (score: number, maxScore: number, classification: string) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      addPageNumber();
      currentY = margin;
    }
    
    const boxHeight = 35;
    const boxWidth = pageWidth - 2 * margin;
    
    // Determinar cor baseada na classificação
    let scoreColor: [number, number, number] = successColor;
    if (classification.toLowerCase().includes('provável') || classification.toLowerCase().includes('positiva')) {
      scoreColor = dangerColor;
    } else if (classification.toLowerCase().includes('moderado') || classification.toLowerCase().includes('risco')) {
      scoreColor = warningColor;
    }
    
    // Background com transparência
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setLineWidth(1);
    doc.roundedRect(margin, currentY, boxWidth, boxHeight, 3, 3, 'S');
    
    // Score grande
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text(`${score}`, margin + 15, currentY + 22);
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text(`/ ${maxScore}`, margin + 15 + doc.getTextWidth(`${score}`), currentY + 22);
    
    // Classificação
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(classification, margin + 15, currentY + 30);
    
    currentY += boxHeight + 10;
  };

  // Cabeçalho
  addHeader();

  // Dados do Paciente
  addSection('DADOS DO PACIENTE');
  
  if (report.patient_name) {
    addInfoBox('Nome', report.patient_name);
  }
  if (report.patient_gender) {
    const gender = report.patient_gender === 'MALE' ? 'Masculino' : 
                   report.patient_gender === 'FEMALE' ? 'Feminino' : 'Outro';
    addInfoBox('Genero', gender);
  }
  if (report.patient_age) {
    addInfoBox('Idade', `${report.patient_age} anos`);
  }
  addInfoBox('Metodo de Avaliacao', report.assessment_method || 'ASRS-18');
  
  currentY += 5;

  // Resultados
  addSection('RESULTADOS DA AVALIACAO');
  const maxScore = report.assessment_method === 'DIVA 2.0' ? 18 : 72;
  const effectiveScore = report.score ?? 0;
  
  if (report.classification) {
    addScoreBox(effectiveScore, maxScore, report.classification);
  } else {
    addInfoBox('Pontuacao Total', `${effectiveScore}/${maxScore}`);
    currentY += 5;
  }

  // Perguntas e Respostas
  addSection('PERGUNTAS E RESPOSTAS');
  
  if (report.assessment_method === 'DIVA 2.0') {
    // DIVA 2.0 format
    const responses = report.responses;
    
    if (responses.inattention) {
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      addText('DESATENCAO', 12, true, secondaryColor);
      currentY += 2;
      
      responses.inattention.forEach((item: any, index: number) => {
        if (currentY > pageHeight - 50) {
          doc.addPage();
          addPageNumber();
          currentY = margin;
        }
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        addText(`${index + 1}. ${item.question}`, 10, false);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        addText(`   Infancia: ${item.childhood || 'Nao respondido'}`, 9, false, [100, 100, 100]);
        addText(`   Vida Adulta: ${item.adulthood || 'Nao respondido'}`, 9, false, [100, 100, 100]);
        currentY += 3;
      });
      currentY += 5;
    }

    if (responses.hyperactivity) {
      addText('HIPERATIVIDADE/IMPULSIVIDADE', 12, true, secondaryColor);
      currentY += 2;
      
      responses.hyperactivity.forEach((item: any, index: number) => {
        if (currentY > pageHeight - 50) {
          doc.addPage();
          addPageNumber();
          currentY = margin;
        }
        
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        addText(`${index + 1}. ${item.question}`, 10, false);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        addText(`   Infancia: ${item.childhood || 'Nao respondido'}`, 9, false, [100, 100, 100]);
        addText(`   Vida Adulta: ${item.adulthood || 'Nao respondido'}`, 9, false, [100, 100, 100]);
        currentY += 3;
      });
    }
  } else {
    // ASRS-18 format
    const questions = [
      "Com que frequencia voce comete erros por falta de atencao quando tem de trabalhar num projeto chato ou dificil?",
      "Com que frequencia voce tem dificuldade para manter a atencao quando esta fazendo um trabalho chato ou repetitivo?",
      "Com que frequencia voce tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estao falando diretamente com voce?",
      "Com que frequencia voce deixa um projeto pela metade depois de ja ter feito as partes mais dificeis?",
      "Com que frequencia voce tem dificuldade para fazer um trabalho que exige organizacao?",
      "Quando voce precisa fazer algo que exige muita concentracao, com que frequencia voce evita ou adia o inicio?",
      "Com que frequencia voce coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?",
      "Com que frequencia voce se distrai com atividades ou barulho a sua volta?",
      "Com que frequencia voce tem dificuldade para lembrar de compromissos ou obrigacoes?",
      "Com que frequencia voce fica se mexendo na cadeira ou balancando as maos ou os pes quando precisa ficar sentado por muito tempo?",
      "Com que frequencia voce se levanta da cadeira em reunioes ou em outras situacoes onde deveria ficar sentado?",
      "Com que frequencia voce se sente inquieto ou agitado?",
      "Com que frequencia voce tem dificuldade para sossegar e relaxar quando tem tempo livre para voce?",
      "Com que frequencia voce se sente ativo demais e necessitado de fazer coisas, como se estivesse 'com um motor ligado'?",
      "Com que frequencia voce se pega falando demais em situacoes sociais?",
      "Quando voce esta conversando, com que frequencia voce se pega terminando as frases das pessoas antes delas?",
      "Com que frequencia voce tem dificuldade para esperar nas situacoes onde cada um tem a sua vez?",
      "Com que frequencia voce interrompe os outros quando eles estao ocupados?"
    ];

    const responseOptions = ['Nunca', 'Raramente', 'As vezes', 'Frequentemente', 'Muito frequentemente'];
    const responseColors: Array<[number, number, number]> = [
      [34, 197, 94],   // Verde - Nunca
      [132, 204, 22],  // Verde claro - Raramente
      [234, 179, 8],   // Amarelo - Às vezes
      [249, 115, 22],  // Laranja - Frequentemente
      [239, 68, 68]    // Vermelho - Muito frequentemente
    ];
    
    if (Array.isArray(report.responses)) {
      report.responses.forEach((response: number, index: number) => {
        if (index < questions.length) {
          if (currentY > pageHeight - 50) {
            doc.addPage();
            addPageNumber();
            currentY = margin;
          }
          
          // Indicador colorido
          const circleColor = responseColors[response] || darkGray;
          doc.setFillColor(circleColor[0], circleColor[1], circleColor[2]);
          doc.circle(margin + 3, currentY - 2, 2, 'F');
          
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          addText(`${index + 1}. ${questions[index]}`, 10, false);
          
          // Resposta colorida
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(circleColor[0], circleColor[1], circleColor[2]);
          addText(`   > ${responseOptions[response] || 'Nao respondido'}`, 9, true, circleColor);
          currentY += 3;
        }
      });
    }
  }

  currentY += 10;

  // Recomendações
  if (report.recommendations) {
    addSection('RECOMENDACOES');
    
    // Box com fundo colorido
    const recLines = doc.splitTextToSize(report.recommendations, pageWidth - 2 * margin - 10);
    const boxHeight = recLines.length * 6 + 10;
    
    if (currentY + boxHeight > pageHeight - 40) {
      doc.addPage();
      addPageNumber();
      currentY = margin;
    }
    
    doc.setFillColor(254, 243, 199); // Amarelo claro
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, boxHeight, 3, 3, 'F');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    addText(report.recommendations, 10);
    currentY += 5;
  }

  // Análise Premium
  if (report.is_premium && report.full_report) {
    addSection('ANALISE DETALHADA COM IA');
    
    doc.setFillColor(243, 232, 255); // Roxo claro
    const reportLines = doc.splitTextToSize(report.full_report, pageWidth - 2 * margin - 10);
    const boxHeight = Math.min(reportLines.length * 6 + 10, pageHeight - currentY - 60);
    
    doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, boxHeight, 3, 3, 'F');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    addText(report.full_report, 10);
    currentY += 10;
  }

  // Disclaimer
  addSection('AVISO IMPORTANTE');
  
  // Box de aviso
  const disclaimerText = 'Esta avaliacao e uma ferramenta de triagem e NAO substitui um diagnostico profissional. ' +
    (report.assessment_method === 'DIVA 2.0'
      ? 'O DIVA 2.0 e uma entrevista diagnostica estruturada validada cientificamente para identificar sinais de TDAH em adultos, baseada nos criterios do DSM-5. No entanto, apenas um profissional de saude mental qualificado pode realizar um diagnostico definitivo.'
      : 'O ASRS-18 e um questionario validado cientificamente para identificar sinais de TDAH, mas apenas um profissional de saude mental qualificado pode realizar um diagnostico definitivo.');
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10);
  const disclaimerHeight = disclaimerLines.length * 6 + 10;
  
  if (currentY + disclaimerHeight > pageHeight - 40) {
    doc.addPage();
    addPageNumber();
    currentY = margin;
  }
  
  doc.setFillColor(254, 226, 226); // Vermelho claro
  doc.roundedRect(margin, currentY - 5, pageWidth - 2 * margin, disclaimerHeight, 3, 3, 'F');
  
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  addText(disclaimerText, 9);
  
  // Rodapé final
  addPageNumber();
  const totalPages = pageNumber - 1;
  doc.setPage(1);
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(`Total de paginas: ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);

  return doc;
};
