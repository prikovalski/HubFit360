
export interface AssessmentRequest {
  userId: string;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  sex: string;
  height: number;
  weight: number;
}

export interface UserData {
  birth_date?: string;
  gender?: string;
  patient_profiles?: PatientProfile[];
}

export interface PatientProfile {
  neck_circumference?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  physical_activity?: string;
  chronic_disease?: string;
  goal?: string;
}

export interface AssessmentResult {
  success: boolean;
  assessment?: any;
  bodyFat?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  bmi?: number;
  age?: number;
  error?: string;
}
