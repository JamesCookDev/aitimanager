-- Add unique constraint on user_id for user_roles to support upsert
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Allow super admins to delete profiles (needed for user removal)
CREATE POLICY "Super admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));
