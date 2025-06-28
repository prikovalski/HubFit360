
export interface PhysicalActivity {
  name: string;
  frequency?: string;
}

export interface PatientData {
  gender: string;
  birthDate: string;
  height: number;
  weight: number;
  neckCircumference?: string | null;
  waistCircumference?: string | null;
  hipCircumference?: string | null;
  goal?: string | null;
  chronicDisease?: string | null;
  medicalRestriction?: string | null;
  foodAllergy?: string | null;
  avoidFood?: string | null;
  fixedMealTimes?: string | null;
  mustHaveFood?: string | null;
  physicalActivity?: string | null;
  physicalActivities?: PhysicalActivity[];
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

export interface UserData {
  id: string;
  gender?: string;
  birth_date?: string;
  patient_profiles?: PatientProfile[];
}

export interface PatientProfile {
  neck_circumference?: number | null;
  waist_circumference?: number | null;
  hip_circumference?: number | null;
  physical_activity?: string | null;
  physical_activities?: PhysicalActivity[];
  chronic_disease?: string | null;
  goal?: string | null;
}
