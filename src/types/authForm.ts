
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
  weight: string;
  height: string;
  city: string;
  state: string;
  goal: string;
  intensity: string;
  physicalActivity: string;
  activityFrequency: string;
  physicalActivities: PhysicalActivity[];
  neckCircumference: string;
  waistCircumference: string;
  hipCircumference: string;
}
