
export interface AssessmentRequest {
  userId: string;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  sex: string;
  height: number;
  weight: number;
  patientName?: string | null;
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
