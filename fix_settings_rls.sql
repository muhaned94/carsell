-- FIX RLS Policies for settings table
DROP POLICY IF EXISTS "Public read access for settings" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;

-- Allow everyone to read settings (required for currency conversion globally)
CREATE POLICY "Enable read access for all users" ON "public"."settings"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Allow admins to manage settings (using role check in profiles table)
CREATE POLICY "Enable all access for admins only" ON "public"."settings"
AS PERMISSIVE FOR ALL
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

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
