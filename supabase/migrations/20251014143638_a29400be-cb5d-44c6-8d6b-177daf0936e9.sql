-- Make assessments storage bucket private for security
-- This prevents unauthorized access to sensitive body assessment photos

UPDATE storage.buckets 
SET public = false 
WHERE id = 'assessments';

-- Add RLS policy for assessments bucket to restrict access to authenticated users
-- Users can only access their own assessment photos
CREATE POLICY "Users can view their own assessment photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assessments' 
  AND auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id IN (
      SELECT user_id 
      FROM assessments 
      WHERE front_photo LIKE '%' || name || '%'
         OR side_photo LIKE '%' || name || '%'
         OR back_photo LIKE '%' || name || '%'
    )
  )
);

CREATE POLICY "Users can upload their own assessment photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assessments'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own assessment photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assessments'
  AND auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id IN (
      SELECT user_id 
      FROM assessments 
      WHERE front_photo LIKE '%' || name || '%'
         OR side_photo LIKE '%' || name || '%'
         OR back_photo LIKE '%' || name || '%'
    )
  )
);

CREATE POLICY "Users can delete their own assessment photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assessments'
  AND auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id IN (
      SELECT user_id 
      FROM assessments 
      WHERE front_photo LIKE '%' || name || '%'
         OR side_photo LIKE '%' || name || '%'
         OR back_photo LIKE '%' || name || '%'
    )
  )
);