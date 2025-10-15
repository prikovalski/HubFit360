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
    currentY += 3;
  };

  const addSection = (title: string) => {
    currentY += 5;
    addText(title, 14, true);
  };

  // Cabeçalho
  addText('HUBFIT360', 20, true);
  addText('Relatório de Avaliação TDAH', 16, true);
  addText(`Data: ${new Date(report.created_at).toLocaleDateString('pt-BR')}`, 12);
  currentY += 10;

  // Dados do Paciente
  addSection('DADOS DO PACIENTE');
  if (report.patient_name) {
    addText(`Nome: ${report.patient_name}`);
  }
  if (report.patient_gender) {
    const gender = report.patient_gender === 'MALE' ? 'Masculino' : 
                   report.patient_gender === 'FEMALE' ? 'Feminino' : 'Outro';
    addText(`Gênero: ${gender}`);
  }
  if (report.patient_age) {
    addText(`Idade: ${report.patient_age} anos`);
  }
  addText(`Método de Avaliação: ${report.assessment_method || 'ASRS-18'}`);
  currentY += 10;

  // Resultados
  addSection('RESULTADOS DA AVALIAÇÃO');
  const maxScore = report.assessment_method === 'DIVA 2.0' ? 18 : 72;
  const effectiveScore = report.score ?? 0;
  addText(`Pontuação Total: ${effectiveScore}/${maxScore}`, 12, true);
  if (report.classification) {
    addText(`Classificação: ${report.classification}`, 12, true);
  }
  currentY += 10;

  // Perguntas e Respostas
  addSection('PERGUNTAS E RESPOSTAS');
  
  if (report.assessment_method === 'DIVA 2.0') {
    // DIVA 2.0 format
    const responses = report.responses;
    
    if (responses.inattention) {
      addText('DESATENÇÃO', 12, true);
      responses.inattention.forEach((item: any, index: number) => {
        addText(`${index + 1}. ${item.question}`);
        addText(`   Infância: ${item.childhood || 'Não respondido'}`, 10);
        addText(`   Vida Adulta: ${item.adulthood || 'Não respondido'}`, 10);
        currentY += 2;
      });
    }

    if (responses.hyperactivity) {
      addText('HIPERATIVIDADE/IMPULSIVIDADE', 12, true);
      responses.hyperactivity.forEach((item: any, index: number) => {
        addText(`${index + 1}. ${item.question}`);
        addText(`   Infância: ${item.childhood || 'Não respondido'}`, 10);
        addText(`   Vida Adulta: ${item.adulthood || 'Não respondido'}`, 10);
        currentY += 2;
      });
    }
  } else {
    // ASRS-18 format
    const questions = [
      "Com que frequência você comete erros por falta de atenção quando tem de trabalhar num projeto chato ou difícil?",
      "Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?",
      "Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?",
      "Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais difíceis?",
      "Com que frequência você tem dificuldade para fazer um trabalho que exige organização?",
      "Quando você precisa fazer algo que exige muita concentração, com que frequência você evita ou adia o início?",
      "Com que frequência você coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?",
      "Com que frequência você se distrai com atividades ou barulho a sua volta?",
      "Com que frequência você tem dificuldade para lembrar de compromissos ou obrigações?",
      "Com que frequência você fica se mexendo na cadeira ou balançando as mãos ou os pés quando precisa ficar sentado por muito tempo?",
      "Com que frequência você se levanta da cadeira em reuniões ou em outras situações onde deveria ficar sentado?",
      "Com que frequência você se sente inquieto ou agitado?",
      "Com que frequência você tem dificuldade para sossegar e relaxar quando tem tempo livre para você?",
      "Com que frequência você se sente ativo demais e necessitado de fazer coisas, como se estivesse 'com um motor ligado'?",
      "Com que frequência você se pega falando demais em situações sociais?",
      "Quando você está conversando, com que frequência você se pega terminando as frases das pessoas antes delas?",
      "Com que frequência você tem dificuldade para esperar nas situações onde cada um tem a sua vez?",
      "Com que frequência você interrompe os outros quando eles estão ocupados?"
    ];

    const responseOptions = ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Muito frequentemente'];
    
    if (Array.isArray(report.responses)) {
      report.responses.forEach((response: number, index: number) => {
        if (index < questions.length) {
          addText(`${index + 1}. ${questions[index]}`);
          addText(`   Resposta: ${responseOptions[response] || 'Não respondido'}`, 10);
          currentY += 2;
        }
      });
    }
  }

  currentY += 10;

  // Recomendações
  if (report.recommendations) {
    addSection('RECOMENDAÇÕES');
    addText(report.recommendations);
    currentY += 10;
  }

  // Análise Premium
  if (report.is_premium && report.full_report) {
    addSection('ANÁLISE DETALHADA COM IA');
    addText(report.full_report);
    currentY += 10;
  }

  // Disclaimer
  addSection('AVISO IMPORTANTE');
  addText('Esta avaliação é uma ferramenta de triagem e NÃO substitui um diagnóstico profissional.');
  addText(report.assessment_method === 'DIVA 2.0'
    ? 'O DIVA 2.0 é uma entrevista diagnóstica estruturada validada cientificamente para identificar sinais de TDAH em adultos, baseada nos critérios do DSM-5. No entanto, apenas um profissional de saúde mental qualificado pode realizar um diagnóstico definitivo.'
    : 'O ASRS-18 é um questionário validado cientificamente para identificar sinais de TDAH, mas apenas um profissional de saúde mental qualificado pode realizar um diagnóstico definitivo.');
  
  // Rodapé
  currentY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Este relatório foi gerado pela HubFit360 - Avaliação TDAH', margin, currentY);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, currentY + 7);

  return doc;
};
