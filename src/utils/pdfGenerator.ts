
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

  // Cabeçalho
  addText('HUBFIT360', 20, true);
  addText('Laudo de Avaliação Física', 16, true);
  addText(`Data: ${new Date(report.date).toLocaleDateString('pt-BR')}`, 12);
  currentY += 10;

  // Dados Pessoais
  addText('DADOS PESSOAIS', 14, true);
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
  
  currentY += 10;

  // Resultados (dados reais da avaliação)
  addText('RESULTADOS DA AVALIAÇÃO', 14, true);
  addText(`Massa Magra: ${report.preview.leanMass}`);
  addText(`Gordura Corporal: ${report.preview.bodyFat}`);
  addText(`IMC: ${report.preview.bmi}`);
  
  if (report.preview.fatMass) {
    addText(`Massa de Gordura: ${report.preview.fatMass}`);
  }
  
  currentY += 10;

  // Análise Visual (usando dados reais se disponível)
  addText('ANÁLISE VISUAL E COMPOSIÇÃO CORPORAL', 14, true);
  
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
  addText('VALORES IDEAIS', 14, true);
  
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
    addText('RECOMENDAÇÕES PERSONALIZADAS', 14, true);
    
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

  // Nota sobre a Fórmula de Deurenberg
  addText('NOTA TÉCNICA', 14, true);
  addText('A fórmula de Deurenberg pode superestimar a % de gordura em pessoas com boa massa muscular, pois usa apenas IMC e idade, sem diferenciar entre peso de gordura e peso magro.');
  
  currentY += 10;

  // Rodapé
  currentY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Este laudo foi gerado pela HubFit360 - Avaliação Física com IA', margin, currentY);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, currentY + 7);

  return doc;
};
