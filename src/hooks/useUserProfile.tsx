
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: number;
  auth_user_id: string;
  name: string;
  gender: string | null;
  birth_date: string | null;
  email: string;
  role: "PATIENT" | "ADMIN" | "NUTRITIONIST" | "TRAINER";
  created_at: string;
}

interface PatientProfile {
  id: number;
  user_id: number;
  height: number | null;
  weight: number | null;
  city: string | null;
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

export const useUserProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setPatientProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (userError) throw userError;
      setUserProfile(userData);

      // Fetch patient profile if exists
      if (userData) {
        const { data: patientData, error: patientError } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (!patientError && patientData) {
          setPatientProfile(patientData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_user_id', user.id);

    if (!error) {
      setUserProfile({ ...userProfile, ...updates });
    }
    return { error };
  };

  const createOrUpdatePatientProfile = async (profileData: Partial<PatientProfile>) => {
    if (!user || !userProfile) return;

    if (patientProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('patient_profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('user_id', userProfile.id);

      if (!error) {
        setPatientProfile({ ...patientProfile, ...profileData });
      }
      return { error };
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('patient_profiles')
        .insert([{ ...profileData, user_id: userProfile.id }])
        .select()
        .single();

      if (!error && data) {
        setPatientProfile(data);
      }
      return { error };
    }
  };

  return {
    userProfile,
    patientProfile,
    loading,
    updateUserProfile,
    createOrUpdatePatientProfile,
    refetch: fetchUserProfile
  };
};
