// Storage helpers for secure file access with signed URLs

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Generate a signed URL for a storage object with 1-hour expiration
 * @param supabase - Supabase client instance
 * @param bucket - Storage bucket name
 * @param path - File path within the bucket
 * @returns Signed URL or null if generation fails
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiration

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Exception creating signed URL:', error);
    return null;
  }
}

/**
 * Generate signed URLs for multiple assessment photos
 * @param supabase - Supabase client instance
 * @param assessment - Assessment object with photo URLs
 * @returns Object with signed URLs for each photo
 */
export async function getAssessmentPhotoSignedUrls(
  supabase: SupabaseClient,
  assessment: {
    front_photo: string;
    side_photo: string;
    back_photo: string;
  }
): Promise<{
  front_photo_url: string | null;
  side_photo_url: string | null;
  back_photo_url: string | null;
}> {
  // Extract just the filename from the full URL if needed
  const extractFilename = (url: string): string => {
    if (url.includes('/storage/v1/object/public/')) {
      const parts = url.split('/storage/v1/object/public/assessments/');
      return parts[1] || url;
    }
    return url;
  };

  const [frontUrl, sideUrl, backUrl] = await Promise.all([
    getSignedUrl(supabase, 'assessments', extractFilename(assessment.front_photo)),
    getSignedUrl(supabase, 'assessments', extractFilename(assessment.side_photo)),
    getSignedUrl(supabase, 'assessments', extractFilename(assessment.back_photo)),
  ]);

  return {
    front_photo_url: frontUrl,
    side_photo_url: sideUrl,
    back_photo_url: backUrl,
  };
}
