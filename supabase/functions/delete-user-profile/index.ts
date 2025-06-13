
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create client with user's token to verify auth
    const supabaseClient = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('Unauthorized')
    }

    console.log('Deleting profile for user:', user.id)

    // Get user profile to get the user_id for related tables
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error getting user profile:', profileError)
      throw new Error('Profile not found')
    }

    console.log('Found user profile with ID:', userProfile.id)

    // Delete in correct order of dependencies (deepest children first)
    
    // 1. Delete payment_preferences first (they reference payments)
    const { error: paymentPreferencesError } = await supabase
      .from('payment_preferences')
      .delete()
      .in('payment_id', 
        supabase
          .from('payments')
          .select('id')
          .eq('user_id', userProfile.id)
      )
    
    if (paymentPreferencesError) {
      console.error('Error deleting payment preferences:', paymentPreferencesError)
    } else {
      console.log('Deleted payment preferences for user')
    }

    // 2. Delete payments (they reference assessments and users)
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .eq('user_id', userProfile.id)
    
    if (paymentsError) {
      console.error('Error deleting payments:', paymentsError)
    } else {
      console.log('Deleted payments for user')
    }

    // 3. Delete assessments (they reference users)
    const { error: assessmentsError } = await supabase
      .from('assessments')
      .delete()
      .eq('user_id', userProfile.id)
    
    if (assessmentsError) {
      console.error('Error deleting assessments:', assessmentsError)
    } else {
      console.log('Deleted assessments for user')
    }

    // 4. Delete patient profile (references users)
    const { error: patientProfileError } = await supabase
      .from('patient_profiles')
      .delete()
      .eq('user_id', userProfile.id)
    
    if (patientProfileError) {
      console.error('Error deleting patient profile:', patientProfileError)
    } else {
      console.log('Deleted patient profile for user')
    }

    // 5. Delete user profile
    const { error: userProfileError } = await supabase
      .from('users')
      .delete()
      .eq('auth_user_id', user.id)
    
    if (userProfileError) {
      console.error('Error deleting user profile:', userProfileError)
      throw new Error('Failed to delete user profile')
    } else {
      console.log('Deleted user profile')
    }

    // 6. Finally, delete the auth user (this will cascade and clean up auth-related data)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      throw new Error('Failed to delete auth user')
    } else {
      console.log('Deleted auth user')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Profile deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in delete-user-profile function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
