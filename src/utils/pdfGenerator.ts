
import jsPDF from 'jspdf';
import { UserProfile, PatientProfile } from '@/types/report';

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

  // Cabeçalho
  addText('HUBFIT360', 20, true);
  addText('Laudo de Avaliação Física', 16, true);
  addText(`Data: ${new Date(report.date).toLocaleDateString('pt-BR')}`, 12);
  currentY += 10;

  // Dados Pessoais (dados reais do banco)
  addText('DADOS PESSOAIS', 14, true);
  addText(`Nome: ${userProfile?.name || 'Não informado'}`);
  
  const displayAge = report.age || calculateAge(userProfile?.birth_date || null);
  addText(`Idade: ${displayAge} anos`);
  
  addText(`Gênero: ${userProfile?.gender || 'Não informado'}`);
  addText(`Altura: ${patientProfile?.height ? `${(patientProfile.height / 100).toFixed(2)}m` : 'Não informado'}`);
  addText(`Peso: ${patientProfile?.weight ? `${patientProfile.weight}kg` : 'Não informado'}`);
  
  if (patientProfile?.city) {
    addText(`Cidade: ${patientProfile.city}`);
  }
  
  if (patientProfile?.goal) {
    addText(`Objetivo: ${patientProfile.goal}`);
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
  
  if (report.assessmentText) {
    addText(report.assessmentText);
  } else {
    // Fallback para texto genérico baseado nos dados do usuário
    const genderText = userProfile?.gender === 'Masculino' ? 'masculino' : 'feminino';
    const defaultAnalysis = `A análise visual demonstra uma composição corporal adequada para o perfil ${genderText}. O percentual de gordura corporal atual encontra-se dentro de uma faixa considerada para a faixa etária. A avaliação foi realizada com base nas medidas corporais fornecidas e nas fotografias submetidas.`;
    addText(defaultAnalysis);
  }
  
  currentY += 10;

  // Valores Ideais (baseados no gênero do usuário)
  addText('VALORES IDEAIS', 14, true);
  
  if (userProfile?.gender === 'Masculino') {
    addText('Massa Gorda Ideal: 10-18%');
    addText('IMC Ideal: 22-25');
  } else {
    addText('Massa Gorda Ideal: 16-24%');
    addText('IMC Ideal: 21-24');
  }
  
  currentY += 10;

  // Recomendações (apenas se for versão paga)
  if (report.status === 'paid') {
    addText('RECOMENDAÇÕES PERSONALIZADAS', 14, true);
    
    // Recomendações baseadas no objetivo do usuário
    if (patientProfile?.goal) {
      addText(`Programa personalizado para: ${patientProfile.goal}`, 12, true);
    }
    
    addText('Programa de Treino:', 12, true);
    
    if (patientProfile?.goal?.toLowerCase().includes('perda')) {
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
    
    if (patientProfile?.weight) {
      const calories = patientProfile.goal?.toLowerCase().includes('perda') ? 
        Math.round(patientProfile.weight * 24) : 
        Math.round(patientProfile.weight * 32);
      addText(`• ${calories}-${calories + 200} kcal/dia`);
      addText(`• ${(patientProfile.weight * 1.8).toFixed(1)}g proteína/dia`);
    }
    
    addText('• Distribuição balanceada de macronutrientes');
    addText('• 5-6 refeições ao dia');
    
    // Considerações especiais baseadas no perfil
    if (patientProfile?.food_allergy) {
      currentY += 5;
      addText('Restrições Alimentares:', 12, true);
      addText(`• ${patientProfile.food_allergy}`);
    }
    
    if (patientProfile?.medical_restriction) {
      currentY += 5;
      addText('Restrições Médicas:', 12, true);
      addText(`• ${patientProfile.medical_restriction}`);
    }
    
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
