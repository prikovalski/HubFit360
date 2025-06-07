
export function calculateBodyFatPercentage(
  weight: number,
  height: number,
  age: number,
  gender: string
): number {
  // Calcular IMC primeiro
  const heightM = height / 100; // converter cm para metros
  const bmi = weight / (heightM * heightM);
  
  // Fórmula de Deurenberg
  // %BF = 1.20 × IMC + 0.23 × idade - 10.8 × sexo - 5.4
  // onde sexo = 1 para homens e 0 para mulheres
  
  const genderFactor = gender.toLowerCase() === 'male' || gender === 'MALE' ? 1 : 0;
  
  const bodyFatPercentage = (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
  
  // Garantir que o resultado não seja negativo ou muito alto
  return Math.max(0, Math.min(bodyFatPercentage, 50));
}

export function calculateLeanMass(weight: number, bodyFatPercentage: number): number {
  const fatMass = (bodyFatPercentage / 100) * weight;
  return weight - fatMass;
}

export function calculateFatMass(weight: number, bodyFatPercentage: number): number {
  return (bodyFatPercentage / 100) * weight;
}
