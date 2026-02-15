-- FIX RLS Policies for cars table to allow admins to manage everything
DROP POLICY IF EXISTS "Admins can update any car" ON cars;
DROP POLICY IF EXISTS "Admins can delete any car" ON cars;

-- Allow admins to update any car
CREATE POLICY "Admins can update any car" ON "public"."cars"
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

-- Allow admins to delete any car
CREATE POLICY "Admins can delete any car" ON "public"."cars"
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
