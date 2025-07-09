
export interface PhysicalActivity {
  type: string;
  frequency: string;
}

export interface FormData {
  email: string;
  password: string;
  name: string;
  userType: 'patient' | 'professional';
  profession?: string;
  gender: string;
  birthDate: string;
  weight?: string; // Tornado opcional
  height?: string; // Tornado opcional
  city: string;
  state: string;
  goal: string;
  intensity: string;
  physicalActivity: string;
  activityFrequency: string;
  physicalActivities: PhysicalActivity[];
  neckCircumference?: string; // Tornado opcional
  waistCircumference?: string; // Tornado opcional
  hipCircumference?: string; // Tornado opcional
}
