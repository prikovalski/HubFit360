
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
  const lineHeight = 7;
  let currentY = margin;
  
  // Função para adicionar texto com quebra de linha
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, color: [number, number, number] = [51, 51, 51]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    textLines.forEach((line: string) => {
      if (currentY > pageHeight - margin - 30) {
        doc.addPage();
        currentY = margin;
      }
      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });
    currentY += 2;
  };

  // Função para adicionar título de seção
  const addSectionTitle = (title: string) => {
    if (currentY > pageHeight - margin - 50) {
      doc.addPage();
      currentY = margin;
    }
    currentY += 5;
    doc.setFillColor(1, 159, 128);
    doc.rect(margin, currentY - 5, 3, 10, 'F');
    addText(title, 14, true, [1, 159, 128]);
    currentY += 3;
  };

  // Função para adicionar gráfico de composição corporal
  const addBodyCompositionChart = (leanMass: number, fatMass: number) => {
    if (currentY > pageHeight - margin - 80) {
      doc.addPage();
      currentY = margin;
    }

    addSectionTitle('COMPOSIÇÃO CORPORAL');
    
    const totalWeight = leanMass + fatMass;
    const leanPercentage = (leanMass / totalWeight) * 100;
    const fatPercentage = (fatMass / totalWeight) * 100;
    
    const chartX = margin;
    const chartY = currentY;
    const barWidth = pageWidth - 2 * margin;
    const barHeight = 20;
    
    // Barra de massa magra
    doc.setFillColor(1, 159, 128);
    const leanBarWidth = (barWidth * leanPercentage) / 100;
    doc.rect(chartX, chartY, leanBarWidth, barHeight, 'F');
    
    // Barra de massa gorda
    doc.setFillColor(220, 53, 69);
    doc.rect(chartX + leanBarWidth, chartY, barWidth - leanBarWidth, barHeight, 'F');
    
    // Borda
    doc.setDrawColor(200, 200, 200);
    doc.rect(chartX, chartY, barWidth, barHeight);
    
    currentY += barHeight + 10;
    
    // Legenda
    const legendY = currentY;
    
    // Massa Magra
    doc.setFillColor(1, 159, 128);
    doc.rect(chartX, legendY, 5, 5, 'F');
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.text(`Massa Magra: ${leanMass.toFixed(1)}kg (${leanPercentage.toFixed(1)}%)`, chartX + 8, legendY + 4);
    
    // Massa de Gordura
    doc.setFillColor(220, 53, 69);
    doc.rect(chartX + 90, legendY, 5, 5, 'F');
    doc.text(`Massa de Gordura: ${fatMass.toFixed(1)}kg (${fatPercentage.toFixed(1)}%)`, chartX + 98, legendY + 4);
    
    currentY += 15;
    
    // Peso Total
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Peso Total: ${totalWeight.toFixed(1)}kg`, chartX, currentY);
    doc.setFont(undefined, 'normal');
    
    currentY += 15;
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

  // Cabeçalho com fundo colorido
  doc.setFillColor(1, 159, 128);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('HUBFIT360', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Laudo de Avaliação Física', pageWidth / 2, 30, { align: 'center' });
  
  currentY = 50;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(10);
  doc.text(`Data da Avaliação: ${new Date(report.date).toLocaleDateString('pt-BR')}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 15;

  // Dados Pessoais
  addSectionTitle('DADOS PESSOAIS');
  addText(`Nome: ${displayName}`);
  
  const displayAge = report.age || calculateAge(userProfile?.birth_date || null);
  addText(`Idade: ${displayAge} anos`);
  
  addText(`Gênero: ${displayGender || 'Não informado'}`);
  addText(`Altura: ${displayHeight ? `${(displayHeight / 100).toFixed(2)}m` : 'Não informado'}`);
  addText(`Peso: ${displayWeight ? `${displayWeight}kg` : 'Não informado'}`);
  
  // Mostrar objetivo (priorizar dados da avaliação)
  const displayGoal = report.patient_goal || patientProfile?.goal;
  if (displayGoal) {
    addText(`Objetivo: ${displayGoal}`);
  }
  
  currentY += 5;

  // Resultados (dados reais da avaliação)
  addSectionTitle('RESULTADOS DA AVALIAÇÃO');
  addText(`Massa Magra: ${report.preview.leanMass}`, 11);
  addText(`Gordura Corporal: ${report.preview.bodyFat}`, 11);
  addText(`IMC: ${report.preview.bmi}`, 11);
  
  if (report.preview.fatMass) {
    addText(`Massa de Gordura: ${report.preview.fatMass}`, 11);
  }
  
  currentY += 5;

  // Adicionar gráfico de composição corporal
  if (report.leanMass && report.fatMass) {
    addBodyCompositionChart(report.leanMass, report.fatMass);
  }

  // Análise Visual (usando dados reais se disponível)
  addSectionTitle('ANÁLISE VISUAL E COMPOSIÇÃO CORPORAL');
  
  if (report.assessmentText || report.assessment_text) {
    addText(report.assessmentText || report.assessment_text);
  } else {
    // Fallback para texto genérico baseado nos dados do usuário
    const genderText = (report.patient_gender || userProfile?.gender) === 'Masculino' ? 'masculino' : 'feminino';
    const defaultAnalysis = `A análise visual demonstra uma composição corporal adequada para o perfil ${genderText}. O percentual de gordura corporal atual encontra-se dentro de uma faixa considerada para a faixa etária. A avaliação foi realizada com base nas medidas corporais fornecidas e nas fotografias submetidas.`;
    addText(defaultAnalysis);
  }
  
  currentY += 10;

  // Valores Ideais (baseados no gênero)
  addSectionTitle('VALORES IDEAIS');
  
  const patientGender = report.patient_gender || userProfile?.gender;
  if (patientGender === 'Masculino') {
    addText('Massa Gorda Ideal: 10-18%');
    addText('IMC Ideal: 22-25');
  } else {
    addText('Massa Gorda Ideal: 16-24%');
    addText('IMC Ideal: 21-24');
  }
  
  currentY += 10;

  // Recomendações (apenas se for versão paga)
  if (report.status === 'paid' || report.tier === 'premium') {
    addSectionTitle('RECOMENDAÇÕES PERSONALIZADAS');
    
    // Recomendações baseadas no objetivo
    const goal = report.patient_goal || patientProfile?.goal;
    if (goal) {
      addText(`Programa personalizado para: ${goal}`, 12, true);
    }
    
    addText('Programa de Treino:', 12, true);
    
    if (goal?.toLowerCase().includes('perda')) {
      addText('• 4-5x por semana de exercícios');
      addText('• Foco em exercícios aeróbicos');
      addText('• 3-4x cardio moderado a intenso');
      addText('• Treino funcional e HIIT');
    } else {
      addText('• 4-5x por semana de musculação');
      addText('• Foco em exercícios compostos');
      addText('• 2-3x cardio moderado');
      addText('• Ênfase em hipertrofia');
    }
    
    currentY += 5;
    
    addText('Plano Nutricional:', 12, true);
    
    const weight = displayWeight;
    if (weight) {
      const calories = goal?.toLowerCase().includes('perda') ? 
        Math.round(weight * 24) : 
        Math.round(weight * 32);
      addText(`• ${calories}-${calories + 200} kcal/dia`);
      addText(`• ${(weight * 1.8).toFixed(1)}g proteína/dia`);
    }
    
    addText('• Distribuição balanceada de macronutrientes');
    addText('• 5-6 refeições ao dia');
    
    // Considerações especiais baseadas no perfil
    const foodAllergy = report.patient_food_allergy || patientProfile?.food_allergy;
    if (foodAllergy) {
      currentY += 5;
      addText('Restrições Alimentares:', 12, true);
      addText(`• ${foodAllergy}`);
    }
    
    const medicalRestriction = report.patient_medical_restriction || patientProfile?.medical_restriction;
    if (medicalRestriction) {
      currentY += 5;
      addText('Restrições Médicas:', 12, true);
      addText(`• ${medicalRestriction}`);
    }
    
    currentY += 10;
  }

  // Nota Técnica
  addSectionTitle('NOTA TÉCNICA');
  const methodText = report.measurement_method === 'pollock_7' 
    ? 'Este laudo utilizou o método de 7 dobras cutâneas de Pollock para estimativa da composição corporal, considerado um dos métodos mais precisos para avaliação de gordura corporal.'
    : 'A fórmula de Deurenberg pode superestimar a % de gordura em pessoas com boa massa muscular, pois usa apenas IMC e idade, sem diferenciar entre peso de gordura e peso magro.';
  addText(methodText, 10);
  
  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('HubFit360 - Avaliação Física com IA', margin, pageHeight - 15);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, pageHeight - 8);
  }

  return doc;
};
