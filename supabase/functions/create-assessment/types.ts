
export interface PatientData {
  gender: string;
  birthDate: string;
  height: number;
  weight: number;
  neckCircumference?: number | null;
  waistCircumference?: number | null;
  hipCircumference?: number | null;
  goal?: string | null;
  chronicDisease?: string | null;
  medicalRestriction?: string | null;
  foodAllergy?: string | null;
  avoidFood?: string | null;
  fixedMealTimes?: string | null;
  mustHaveFood?: string | null;
  physicalActivity?: string | null;
}

export interface AssessmentRequest {
  userId: string;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  sex: string;
  height: number;
  weight: number;
  patientName?: string | null;
  assessmentType?: 'self' | 'patient';
  patientData?: PatientData;
}

export interface AssessmentResult {
  success: boolean;
  assessment?: any;
  bodyFat?: number;
  leanMass?: number;
  fatMass?: number;
  bmi?: number;
  age?: number;
  tier?: string;
  error?: string;
}
