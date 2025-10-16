import jsPDF from 'jspdf';
import { UserProfile, PatientProfile } from '@/types/report';
import { mapGenderFromDB } from '@/utils/genderMapping';

interface GeneratePDFProps {
  report: any;
  userProfile: UserProfile | null;
  patientProfile: PatientProfile | null;
}

export const generateAssessmentPDF = ({ report, userProfile, patientProfile }: GeneratePDFProps) => {
  const doc = new jsPDF();
  
  // Configurações básicas
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;
  
  // Paleta de cores (mesma da tela)
  const colors = {
    primary: [1, 159, 128] as [number, number, number],
    primaryLight: [225, 245, 240] as [number, number, number],
    gray800: [31, 41, 55] as [number, number, number],
    gray600: [75, 85, 99] as [number, number, number],
    gray400: [156, 163, 175] as [number, number, number],
    gray200: [229, 231, 235] as [number, number, number],
    gray100: [243, 244, 246] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    destructive: [220, 53, 69] as [number, number, number]
  };

  // Função para verificar espaço na página
  const checkPageSpace = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - 40) {
      doc.addPage();
      currentY = margin + 15;
    }
  };

  // Função para adicionar card/box
  const addCard = (x: number, y: number, width: number, height: number, withBorder: boolean = true) => {
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(x, y, width, height, 'F');
    if (withBorder) {
      doc.setDrawColor(colors.gray200[0], colors.gray200[1], colors.gray200[2]);
      doc.setLineWidth(0.5);
      doc.rect(x, y, width, height);
    }
  };

  // Função para adicionar título de seção com borda
  const addSectionTitle = (title: string) => {
    checkPageSpace(25);
    currentY += 8;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(colors.gray800[0], colors.gray800[1], colors.gray800[2]);
    doc.text(title, margin, currentY);
    currentY += 3;
    
    // Linha separadora
    doc.setDrawColor(colors.gray200[0], colors.gray200[1], colors.gray200[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;
  };

  // Função para adicionar campo de dados em grid
  const addDataField = (label: string, value: string, x: number, y: number, width: number) => {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.gray600[0], colors.gray600[1], colors.gray600[2]);
    doc.text(label, x, y);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.gray800[0], colors.gray800[1], colors.gray800[2]);
    doc.text(value, x, y + 5);
  };

  // Função para adicionar gráfico de composição corporal
  const addBodyCompositionChart = (leanMass: number, fatMass: number) => {
    checkPageSpace(90);
    
    addSectionTitle('Composição Corporal');
    
    const totalWeight = leanMass + fatMass;
    const leanPercentage = (leanMass / totalWeight) * 100;
    const fatPercentage = (fatMass / totalWeight) * 100;
    
    // Card de fundo
    const cardHeight = 60;
    addCard(margin, currentY, contentWidth, cardHeight);
    
    const chartX = margin + 10;
    const chartY = currentY + 10;
    const barWidth = contentWidth - 20;
    const barHeight = 18;
    
    // Barra de massa magra
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    const leanBarWidth = (barWidth * leanPercentage) / 100;
    doc.roundedRect(chartX, chartY, leanBarWidth, barHeight, 2, 2, 'F');
    
    // Barra de massa gorda
    doc.setFillColor(colors.destructive[0], colors.destructive[1], colors.destructive[2]);
    doc.roundedRect(chartX + leanBarWidth, chartY, barWidth - leanBarWidth, barHeight, 2, 2, 'F');
    
    // Legenda
    const legendY = chartY + barHeight + 12;
    
    // Massa Magra
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(chartX, legendY, 4, 4, 1, 1, 'F');
    doc.setTextColor(colors.gray800[0], colors.gray800[1], colors.gray800[2]);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text(`Massa Magra: ${leanMass.toFixed(1)}kg`, chartX + 7, legendY + 3);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.gray600[0], colors.gray600[1], colors.gray600[2]);
    doc.text(`(${leanPercentage.toFixed(1)}%)`, chartX + 45, legendY + 3);
    
    // Massa de Gordura
    doc.setFillColor(colors.destructive[0], colors.destructive[1], colors.destructive[2]);
    doc.roundedRect(chartX + 80, legendY, 4, 4, 1, 1, 'F');
    doc.setTextColor(colors.gray800[0], colors.gray800[1], colors.gray800[2]);
    doc.setFont(undefined, 'bold');
    doc.text(`Massa Gorda: ${fatMass.toFixed(1)}kg`, chartX + 87, legendY + 3);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.gray600[0], colors.gray600[1], colors.gray600[2]);
    doc.text(`(${fatPercentage.toFixed(1)}%)`, chartX + 125, legendY + 3);
    
    currentY += cardHeight + 10;
  };

  // Função para calcular idade
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Determinar qual nome usar (priorizar patient_name se existir)
  const displayName = report.patient_name || userProfile?.name || 'Não informado';

  // Mapear o gênero para português (priorizar dados da avaliação)
  const displayGender = mapGenderFromDB(report.patient_gender || userProfile?.gender);

  // Priorizar dados da avaliação para altura e peso
  const displayHeight = report.patient_height || patientProfile?.height;
  const displayWeight = report.patient_weight || patientProfile?.weight;

  // Cabeçalho moderno
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.text('HUBFIT360', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text('Laudo de Avaliação Física', pageWidth / 2, 28, { align: 'center' });
  
  // Data
  doc.setFontSize(9);
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.text(`Data: ${new Date(report.date).toLocaleDateString('pt-BR')}`, pageWidth / 2, 38, { align: 'center' });
  
  currentY = 55;

  // Dados Pessoais em card
  addSectionTitle('Dados Pessoais');
  
  const cardHeight = 45;
  addCard(margin, currentY, contentWidth, cardHeight);
  
  const col1X = margin + 10;
  const col2X = margin + (contentWidth / 2) + 5;
  const rowY1 = currentY + 10;
  const rowY2 = currentY + 25;
  const rowY3 = currentY + 40;
  const colWidth = (contentWidth / 2) - 15;
  
  const displayAge = report.age || calculateAge(userProfile?.birth_date || null);
  const displayGoal = report.patient_goal || patientProfile?.goal;
  
  // Linha 1
  addDataField('Nome', displayName, col1X, rowY1, colWidth);
  addDataField('Idade', `${displayAge} anos`, col2X, rowY1, colWidth);
  
  // Linha 2
  addDataField('Gênero', displayGender || 'Não informado', col1X, rowY2, colWidth);
  addDataField('Altura', displayHeight ? `${(displayHeight / 100).toFixed(2)}m` : 'Não informado', col2X, rowY2, colWidth);
  
  // Linha 3 (condicional)
  const weightText = displayWeight ? `${displayWeight}kg` : 'Não informado';
  if (displayGoal) {
    addDataField('Peso', weightText, col1X, rowY3, colWidth);
    addDataField('Objetivo', displayGoal, col2X, rowY3, colWidth);
  } else {
    addDataField('Peso', weightText, col1X, rowY3, colWidth);
  }
  
  currentY += cardHeight + 10;

  // Resultados em card
  addSectionTitle('Resultados da Avaliação');
  
  const resultsCardHeight = 35;
  addCard(margin, currentY, contentWidth, resultsCardHeight);
  
  const resultCol1X = margin + 10;
  const resultCol2X = margin + (contentWidth / 2) + 5;
  const resultRowY1 = currentY + 10;
  const resultRowY2 = currentY + 25;
  
  addDataField('Gordura Corporal', report.preview.bodyFat || 'N/A', resultCol1X, resultRowY1, colWidth);
  addDataField('Massa Magra', report.preview.leanMass || 'N/A', resultCol2X, resultRowY1, colWidth);
  addDataField('IMC', report.preview.bmi || 'N/A', resultCol1X, resultRowY2, colWidth);
  
  if (report.preview.fatMass) {
    addDataField('Massa de Gordura', report.preview.fatMass, resultCol2X, resultRowY2, colWidth);
  }
  
  currentY += resultsCardHeight + 10;

  // Adicionar gráfico de composição corporal
  if (report.leanMass && report.fatMass) {
    addBodyCompositionChart(report.leanMass, report.fatMass);
  }

  // Análise Visual
  addSectionTitle('Análise da Composição Corporal');
  
  checkPageSpace(50);
  
  const analysisText = report.assessmentText || report.assessment_text;
  if (analysisText) {
    const analysisCardHeight = Math.max(40, Math.ceil(analysisText.length / 100) * 15);
    addCard(margin, currentY, contentWidth, analysisCardHeight);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.gray800[0], colors.gray800[1], colors.gray800[2]);
    const textLines = doc.splitTextToSize(analysisText, contentWidth - 20);
    let textY = currentY + 10;
    textLines.forEach((line: string) => {
      doc.text(line, margin + 10, textY);
      textY += 5;
    });
    
    currentY += analysisCardHeight + 10;
  }

  // Valores Ideais em card
  addSectionTitle('Faixas Ideais');
  
  const idealCardHeight = 25;
  addCard(margin, currentY, contentWidth, idealCardHeight);
  
  const patientGender = report.patient_gender || userProfile?.gender;
  const idealCol1X = margin + 10;
  const idealCol2X = margin + (contentWidth / 2) + 5;
  const idealRowY = currentY + 10;
  
  if (patientGender === 'Masculino') {
    addDataField('Gordura Corporal Ideal', '10-15%', idealCol1X, idealRowY, colWidth);
    addDataField('IMC Ideal', '20.0-24.9', idealCol2X, idealRowY, colWidth);
  } else {
    addDataField('Gordura Corporal Ideal', '16-24%', idealCol1X, idealRowY, colWidth);
    addDataField('IMC Ideal', '20.0-24.9', idealCol2X, idealRowY, colWidth);
  }
  
  currentY += idealCardHeight + 10;

  // Recomendações (apenas se for versão premium)
  if (report.status === 'paid' || report.tier === 'premium') {
    checkPageSpace(80);
    addSectionTitle('Recomendações Personalizadas');
    
    // Recomendações baseadas no objetivo
    const goal = report.patient_goal || patientProfile?.goal;
    if (goal) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(colors.gray800[0], colors.gray800[1], colors.gray800[2]);
      doc.text(`Programa personalizado para: ${goal}`, margin, currentY);
      currentY += 10;
    }
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Programa de Treino:', margin, currentY);
    currentY += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    if (goal?.toLowerCase().includes('perda')) {
      doc.text('• 4-5x por semana de exercícios', margin + 5, currentY);
      currentY += 5;
      doc.text('• Foco em exercícios aeróbicos', margin + 5, currentY);
      currentY += 5;
      doc.text('• 3-4x cardio moderado a intenso', margin + 5, currentY);
      currentY += 5;
      doc.text('• Treino funcional e HIIT', margin + 5, currentY);
      currentY += 8;
    } else {
      doc.text('• 4-5x por semana de musculação', margin + 5, currentY);
      currentY += 5;
      doc.text('• Foco em exercícios compostos', margin + 5, currentY);
      currentY += 5;
      doc.text('• 2-3x cardio moderado', margin + 5, currentY);
      currentY += 5;
      doc.text('• Ênfase em hipertrofia', margin + 5, currentY);
      currentY += 8;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Plano Nutricional:', margin, currentY);
    currentY += 6;
    
    doc.setFont(undefined, 'normal');
    const weight = displayWeight;
    if (weight) {
      const calories = goal?.toLowerCase().includes('perda') ? 
        Math.round(weight * 24) : 
        Math.round(weight * 32);
      doc.text(`• ${calories}-${calories + 200} kcal/dia`, margin + 5, currentY);
      currentY += 5;
      doc.text(`• ${(weight * 1.8).toFixed(1)}g proteína/dia`, margin + 5, currentY);
      currentY += 5;
    }
    
    doc.text('• Distribuição balanceada de macronutrientes', margin + 5, currentY);
    currentY += 5;
    doc.text('• 5-6 refeições ao dia', margin + 5, currentY);
    currentY += 8;
    
    // Considerações especiais baseadas no perfil
    const foodAllergy = report.patient_food_allergy || patientProfile?.food_allergy;
    if (foodAllergy) {
      doc.setFont(undefined, 'bold');
      doc.text('Restrições Alimentares:', margin, currentY);
      currentY += 6;
      doc.setFont(undefined, 'normal');
      doc.text(`• ${foodAllergy}`, margin + 5, currentY);
      currentY += 8;
    }
    
    const medicalRestriction = report.patient_medical_restriction || patientProfile?.medical_restriction;
    if (medicalRestriction) {
      doc.setFont(undefined, 'bold');
      doc.text('Restrições Médicas:', margin, currentY);
      currentY += 6;
      doc.setFont(undefined, 'normal');
      doc.text(`• ${medicalRestriction}`, margin + 5, currentY);
      currentY += 10;
    }
  }

  // Nota Técnica
  checkPageSpace(35);
  addSectionTitle('Nota Técnica');
  
  const methodText = report.measurement_method === 'pollock_7' 
    ? 'Este laudo utilizou o método de 7 dobras cutâneas de Pollock para estimativa da composição corporal, considerado um dos métodos mais precisos para avaliação de gordura corporal.'
    : 'A fórmula de Deurenberg pode superestimar a % de gordura em pessoas com boa massa muscular, pois usa apenas IMC e idade, sem diferenciar entre peso de gordura e peso magro.';
  
  const noteCardHeight = 25;
  addCard(margin, currentY, contentWidth, noteCardHeight);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(colors.gray600[0], colors.gray600[1], colors.gray600[2]);
  const noteLines = doc.splitTextToSize(methodText, contentWidth - 20);
  let noteY = currentY + 10;
  noteLines.forEach((line: string) => {
    doc.text(line, margin + 10, noteY);
    noteY += 4.5;
  });
  
  // Rodapé moderno em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Fundo do rodapé
    doc.setFillColor(colors.gray100[0], colors.gray100[1], colors.gray100[2]);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Linha superior
    doc.setDrawColor(colors.gray200[0], colors.gray200[1], colors.gray200[2]);
    doc.setLineWidth(0.5);
    doc.line(0, pageHeight - 20, pageWidth, pageHeight - 20);
    
    // Texto do rodapé
    doc.setTextColor(colors.gray600[0], colors.gray600[1], colors.gray600[2]);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('HubFit360 - Avaliação Física com IA', margin, pageHeight - 12);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
  }

  return doc;
};
