-- FIX RLS Policies for profiles table to allow admins to manage users
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON "public"."profiles"
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile" ON "public"."profiles"
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
