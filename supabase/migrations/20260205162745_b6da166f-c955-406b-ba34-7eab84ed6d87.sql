-- Enable realtime for devices table
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;

-- Add INSERT policy for organizations (super_admin only)
CREATE POLICY "Super admins can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Add UPDATE policy for organizations (super_admin only)
CREATE POLICY "Super admins can update organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add DELETE policy for organizations (super_admin only)
CREATE POLICY "Super admins can delete organizations"
ON public.organizations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));