
export function extractNumericValue(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

export function extractAssessmentData(assessment: string) {
  const estimatedBodyFat = extractNumericValue(assessment, /(?:gordura corporal|body fat).*?(\d+(?:[.,]\d+)?)\s*%/i);
  const leanMass = extractNumericValue(assessment, /massa magra.*?(\d+(?:[.,]\d+)?)\s*kg/i);
  const fatMass = extractNumericValue(assessment, /massa gorda.*?(\d+(?:[.,]\d+)?)\s*kg/i);

  console.log('Valores extraídos:', { estimatedBodyFat, leanMass, fatMass });

  return {
    estimatedBodyFat,
    leanMass,
    fatMass
  };
}
