import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { calculateBodyFatPollock7Fold, calculateLeanMassPollock, calculateFatMassPollock } from './pollockCalculations.ts';
import { applyRateLimit } from '../_shared/rateLimiter.ts';
import { createErrorResponse, ERROR_MESSAGES } from '../_shared/errorHandler.ts';
import { 
  validateHeight, 
  validateWeight, 
  validateAge, 
  validateGender,
  validateUUID,
  validateString
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PollockAssessmentData {
  userId: string;
  frontPhoto: string;
  sidePhoto: string;
  backPhoto: string;
  height: number;
  weight: number;
  age?: number;
  gender: string;
  chestFold: number;
  midaxillaryFold: number;
  tricepsFold: number;
  subscapularFold: number;
  abdominalFold: number;
  suprailiacFold: number;
  thighFold: number;
  assessmentType?: 'self' | 'patient';
  patientName?: string;
  patientData?: {
    gender: string;
    birthDate: string;
    height: number;
    weight: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const data: PollockAssessmentData = await req.json();
    console.log('Pollock assessment request received for user:', data.userId);

    // Validate user ID
    if (!validateUUID(data.userId)) {
      return createErrorResponse(
        new Error('Invalid user ID format'),
        'INVALID_INPUT',
        400,
        corsHeaders
      );
    }

    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(data.userId, 10, 60);
    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        new Error('Rate limit exceeded'),
        'RATE_LIMIT_EXCEEDED',
        429,
        corsHeaders
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user data to get the internal user_id
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, gender, birth_date')
      .eq('auth_user_id', data.userId)
      .single();

    if (userError || !users) {
      console.error('Error fetching user:', userError);
      return createErrorResponse(
        new Error('User not found'),
        'NOT_FOUND',
        404,
        corsHeaders
      );
    }

    const internalUserId = users.id;
    const assessmentType = data.assessmentType || 'self';

    // Determine which data to use
    let finalHeight: number;
    let finalWeight: number;
    let finalAge: number;
    let finalGender: string;

    if (assessmentType === 'patient' && data.patientData) {
      // Validate patient data
      if (!validateHeight(data.patientData.height)) {
        return createErrorResponse(
          new Error('Invalid patient height'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
      if (!validateWeight(data.patientData.weight)) {
        return createErrorResponse(
          new Error('Invalid patient weight'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
      if (!validateGender(data.patientData.gender)) {
        return createErrorResponse(
          new Error('Invalid patient gender'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }

      finalHeight = data.patientData.height;
      finalWeight = data.patientData.weight;
      finalGender = data.patientData.gender;

      // Calculate age from birth date
      const birthDate = new Date(data.patientData.birthDate);
      const today = new Date();
      finalAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        finalAge--;
      }

      if (!validateAge(finalAge)) {
        return createErrorResponse(
          new Error('Invalid patient age'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
    } else {
      // Use self data
      if (!validateHeight(data.height)) {
        return createErrorResponse(
          new Error('Invalid height'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
      if (!validateWeight(data.weight)) {
        return createErrorResponse(
          new Error('Invalid weight'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }

      finalHeight = data.height;
      finalWeight = data.weight;
      finalGender = users.gender || data.gender;

      // Calculate age
      if (data.age) {
        finalAge = data.age;
      } else if (users.birth_date) {
        const birthDate = new Date(users.birth_date);
        const today = new Date();
        finalAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          finalAge--;
        }
      } else {
        return createErrorResponse(
          new Error('Age is required'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }

      if (!validateAge(finalAge)) {
        return createErrorResponse(
          new Error('Invalid age'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
      if (!validateGender(finalGender)) {
        return createErrorResponse(
          new Error('Invalid gender'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
    }

    // Validate skinfold measurements
    const skinfolds = [
      data.chestFold,
      data.midaxillaryFold,
      data.tricepsFold,
      data.subscapularFold,
      data.abdominalFold,
      data.suprailiacFold,
      data.thighFold
    ];

    for (const fold of skinfolds) {
      if (typeof fold !== 'number' || fold < 0 || fold > 100) {
        return createErrorResponse(
          new Error('Invalid skinfold measurement'),
          'INVALID_INPUT',
          400,
          corsHeaders
        );
      }
    }

    // Calculate body composition using Pollock 7-Fold formula
    console.log('Calculating body composition using Pollock 7-Fold formula');
    const bodyFatPercentage = calculateBodyFatPollock7Fold(
      data.chestFold,
      data.midaxillaryFold,
      data.tricepsFold,
      data.subscapularFold,
      data.abdominalFold,
      data.suprailiacFold,
      data.thighFold,
      finalAge,
      finalGender
    );

    const leanMass = calculateLeanMassPollock(finalWeight, bodyFatPercentage);
    const fatMass = calculateFatMassPollock(finalWeight, bodyFatPercentage);
    const bmi = finalWeight / Math.pow(finalHeight / 100, 2);

    console.log('Results:', {
      bodyFatPercentage,
      leanMass,
      fatMass,
      bmi
    });

    // Prepare assessment record
    const assessmentRecord: any = {
      user_id: internalUserId,
      assessment_type: assessmentType,
      front_photo: data.frontPhoto,
      side_photo: data.sidePhoto,
      back_photo: data.backPhoto,
      chest_fold: data.chestFold,
      midaxillary_fold: data.midaxillaryFold,
      triceps_fold: data.tricepsFold,
      subscapular_fold: data.subscapularFold,
      abdominal_fold: data.abdominalFold,
      suprailiac_fold: data.suprailiacFold,
      thigh_fold: data.thighFold,
      body_fat_percentage: bodyFatPercentage,
      lean_mass: leanMass,
      fat_mass: fatMass,
      bmi: bmi
    };

    // Add data based on assessment type
    if (assessmentType === 'patient' && data.patientData) {
      assessmentRecord.patient_name = data.patientName || null;
      assessmentRecord.patient_gender = data.patientData.gender;
      assessmentRecord.patient_birth_date = data.patientData.birthDate;
      assessmentRecord.patient_height = data.patientData.height;
      assessmentRecord.patient_weight = data.patientData.weight;
    } else {
      assessmentRecord.height = finalHeight;
      assessmentRecord.weight = finalWeight;
      assessmentRecord.age = finalAge;
      assessmentRecord.gender = finalGender;
    }

    // Save assessment to database
    console.log('Saving Pollock assessment to database');
    const { data: savedAssessment, error: saveError } = await supabase
      .from('pollock_assessments')
      .insert(assessmentRecord)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
      return createErrorResponse(
        saveError,
        'DEFAULT',
        500,
        corsHeaders
      );
    }

    console.log('Pollock assessment saved successfully:', savedAssessment.id);

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        assessment: savedAssessment,
        bodyFat: bodyFatPercentage,
        leanMass: leanMass,
        fatMass: fatMass,
        bmi: bmi
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in create-pollock-assessment function:', error);
    return createErrorResponse(
      error as Error,
      'DEFAULT',
      500,
      corsHeaders
    );
  }
});
