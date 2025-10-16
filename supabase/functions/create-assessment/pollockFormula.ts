
// Pollock 7-Fold Body Fat Calculation
// Reference: Jackson & Pollock (1978, 1980)

export function calculateBodyFatPollock7Fold(
  chest: number,
  midaxillary: number,
  triceps: number,
  subscapular: number,
  abdominal: number,
  suprailiac: number,
  thigh: number,
  age: number,
  gender: string
): number {
  // Sum of 7 skinfolds
  const sum7 = chest + midaxillary + triceps + subscapular + abdominal + suprailiac + thigh;
  
  const genderLower = gender.toLowerCase();
  const isMale = genderLower === 'male' || genderLower === 'masculino';
  
  let bodyDensity: number;
  
  if (isMale) {
    // Men's formula (Jackson & Pollock, 1978)
    bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age);
  } else {
    // Women's formula (Jackson, Pollock & Ward, 1980)
    bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age);
  }
  
  // Convert body density to body fat percentage using Siri equation
  const bodyFatPercentage = ((4.95 / bodyDensity) - 4.50) * 100;
  
  // Ensure result is within realistic bounds
  return Math.max(3, Math.min(bodyFatPercentage, 50));
}

export function calculateLeanMassPollock(weight: number, bodyFatPercentage: number): number {
  const fatMass = (bodyFatPercentage / 100) * weight;
  return weight - fatMass;
}

export function calculateFatMassPollock(weight: number, bodyFatPercentage: number): number {
  return (bodyFatPercentage / 100) * weight;
}
