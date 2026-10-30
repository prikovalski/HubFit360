
export interface ReportPreview {
  leanMass: string;
  bodyFat: string;
  bmi: string;
  fatMass?: string;
  summary?: string;
}

export interface Report {
  id: string;
  date: string;
  status: string;
  tier: 'basic' | 'detailed';
  age?: number;
  assessmentText?: string;
  preview: ReportPreview;
}

export interface UserProfile {
  id: number;
  auth_user_id: string;
  name: string;
  gender: string | null;
  birth_date: string | null;
  email: string;
  role: "PATIENT" | "ADMIN" | "NUTRITIONIST" | "TRAINER" | "PROFESSIONAL";
  profession?: "NUTRICIONISTA" | "MEDICO" | "EDUCADOR_FISICO" | "FISIOTERAPEUTA" | "ENFERMEIRO" | "PSICOLOGO" | "FARMACEUTICO" | "BIOMEDICO" | "DENTISTA" | "TERAPEUTA_OCUPACIONAL" | null;
  created_at: string;
}

export interface PatientProfile {
  id: number;
  user_id: number;
  height: number | null;
  weight: number | null;
  city_id: string | null;
  goal: string | null;
  chronic_disease: string | null;
  medical_restriction: string | null;
  food_allergy: string | null;
  avoid_food: string | null;
  physical_activity: string | null;
  activity_frequency: string | null;
  fixed_meal_times: string | null;
  must_have_food: string | null;
  neck_circumference: number | null;
  waist_circumference: number | null;
  hip_circumference: number | null;
  created_at: string;
  updated_at: string;
}

export interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

export interface Cidade {
  id: number;
  nome: string;
  estado_sigla: string;
}
