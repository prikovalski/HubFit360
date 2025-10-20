import jsPDF from 'jspdf';

interface GeneratePollockPDFProps {
  report: {
    id: string;
    created_at: string;
    assessment_type: 'self' | 'patient';
    patient_name?: string;
    patient_birth_date?: string;
    body_fat_percentage: number;
    lean_mass: number;
    fat_mass: number;
    bmi: number;
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    patient_height?: number;
    patient_weight?: number;
    patient_gender?: string;
    chest_fold: number;
    midaxillary_fold: number;
    triceps_fold: number;
    subscapular_fold: number;
    abdominal_fold: number;
    suprailiac_fold: number;
    thigh_fold: number;
  };
}

export const generatePollockPDF = ({ report }: GeneratePollockPDFProps): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Get correct values based on assessment type
  const height = report.height || report.patient_height || 0;
  const weight = report.weight || report.patient_weight || 0;
  
  // Calculate age from birth date for patient assessments
  let age = report.age || 0;
  if (report.assessment_type === 'patient' && report.patient_birth_date) {
    const birthDate = new Date(report.patient_birth_date);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }
  
  // Convert gender format from Portuguese to English
  let gender = report.gender || report.patient_gender || 'MALE';
  if (gender === 'Masculino') {
    gender = 'MALE';
  } else if (gender === 'Feminino') {
    gender = 'FEMALE';
  }

  const getBodyFatClassification = (bodyFat: number, gender: string) => {
    if (gender === 'MALE') {
      if (bodyFat < 6) return 'Essencial';
      if (bodyFat < 14) return 'Atleta';
      if (bodyFat < 18) return 'Fitness';
      if (bodyFat < 25) return 'Aceitável';
      return 'Obesidade';
    } else {
      if (bodyFat < 14) return 'Essencial';
      if (bodyFat < 21) return 'Atleta';
      if (bodyFat < 25) return 'Fitness';
      if (bodyFat < 32) return 'Aceitável';
      return 'Obesidade';
    }
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Sobrepeso';
    if (bmi < 35) return 'Obesidade Grau I';
    if (bmi < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  };

  const addPageIfNeeded = (requiredSpace: number = 20) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, margin, yPos);
    yPos += size * 0.5;
  };

  const addSection = (title: string) => {
    addPageIfNeeded(15);
    yPos += 5;
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 6, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  };

  const addMetricBox = (label: string, value: string, xOffset: number, width: number) => {
    const boxHeight = 20;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin + xOffset, yPos, width, boxHeight, 2, 2, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(margin + xOffset, yPos, width, boxHeight, 2, 2, 'S');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin + xOffset + 3, yPos + 7);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(value, margin + xOffset + 3, yPos + 15);
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Avaliação', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Método Pollock 7 Dobras', pageWidth / 2, 25, { align: 'center' });
  
  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Patient Info
  const classification = getBodyFatClassification(report.body_fat_percentage, gender);
  addText(report.assessment_type === 'patient' && report.patient_name ? `Paciente: ${report.patient_name}` : 'Autoavaliação', 12, 'bold');
  addText(`Data: ${new Date(report.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 10, 'normal', [100, 100, 100]);
  addText(`Classificação: ${classification}`, 11, 'bold', [59, 130, 246]);
  yPos += 5;

  // Main Results
  addSection('RESULTADOS PRINCIPAIS');
  const boxWidth = (pageWidth - 2 * margin - 15) / 4;
  addMetricBox('Massa Gorda', `${report.fat_mass?.toFixed(1)} kg`, 0, boxWidth);
  addMetricBox('Massa Magra', `${report.lean_mass?.toFixed(1)} kg`, boxWidth + 5, boxWidth);
  addMetricBox('% Gordura', `${report.body_fat_percentage?.toFixed(1)}%`, (boxWidth + 5) * 2, boxWidth);
  addMetricBox('IMC', `${report.bmi?.toFixed(1)}`, (boxWidth + 5) * 3, boxWidth);
  yPos += 25;

  const bmiClassification = getBMIClassification(report.bmi);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Classificação IMC: ${bmiClassification}`, margin + (boxWidth + 5) * 3 + 3, yPos);
  yPos += 5;

  // Body Composition Chart (Simple bar representation)
  addSection('COMPOSIÇÃO CORPORAL');
  const totalMass = report.lean_mass + report.fat_mass;
  const leanPercent = (report.lean_mass / totalMass) * 100;
  const fatPercent = (report.fat_mass / totalMass) * 100;
  
  const chartWidth = pageWidth - 2 * margin - 40;
  const chartHeight = 20;
  const leanWidth = (chartWidth * leanPercent) / 100;
  const fatWidth = (chartWidth * fatPercent) / 100;

  // Lean mass bar
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, yPos, leanWidth, chartHeight, 'F');
  
  // Fat mass bar
  doc.setFillColor(239, 68, 68);
  doc.rect(margin + leanWidth, yPos, fatWidth, chartHeight, 'F');
  
  // Labels
  yPos += chartHeight + 5;
  doc.setFontSize(10);
  doc.setTextColor(59, 130, 246);
  doc.text(`■ Massa Magra: ${leanPercent.toFixed(1)}%`, margin, yPos);
  doc.setTextColor(239, 68, 68);
  doc.text(`■ Massa Gorda: ${fatPercent.toFixed(1)}%`, margin + 70, yPos);
  yPos += 10;

  // Anthropometric Data
  addSection('DADOS ANTROPOMÉTRICOS');
  const dataBoxWidth = (pageWidth - 2 * margin - 15) / 4;
  addMetricBox('Altura', `${height} cm`, 0, dataBoxWidth);
  addMetricBox('Peso', `${weight} kg`, dataBoxWidth + 5, dataBoxWidth);
  addMetricBox('Idade', `${age} anos`, (dataBoxWidth + 5) * 2, dataBoxWidth);
  addMetricBox('Sexo', gender === 'MALE' ? 'Masculino' : 'Feminino', (dataBoxWidth + 5) * 3, dataBoxWidth);
  yPos += 30;

  // Skinfold Measurements
  addSection('MEDIDAS DE DOBRAS CUTÂNEAS (mm)');
  
  // First row
  const foldBoxWidth = (pageWidth - 2 * margin - 20) / 4;
  addMetricBox('Peitoral', `${report.chest_fold} mm`, 0, foldBoxWidth);
  addMetricBox('Axilar Média', `${report.midaxillary_fold} mm`, foldBoxWidth + 5, foldBoxWidth);
  addMetricBox('Tríceps', `${report.triceps_fold} mm`, (foldBoxWidth + 5) * 2, foldBoxWidth);
  addMetricBox('Subescapular', `${report.subscapular_fold} mm`, (foldBoxWidth + 5) * 3, foldBoxWidth);
  yPos += 25;

  // Second row
  addPageIfNeeded(25);
  addMetricBox('Abdominal', `${report.abdominal_fold} mm`, 0, foldBoxWidth);
  addMetricBox('Supra-ilíaca', `${report.suprailiac_fold} mm`, foldBoxWidth + 5, foldBoxWidth);
  addMetricBox('Coxa', `${report.thigh_fold} mm`, (foldBoxWidth + 5) * 2, foldBoxWidth);
  yPos += 30;

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};
