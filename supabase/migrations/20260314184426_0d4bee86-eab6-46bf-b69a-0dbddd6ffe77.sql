
-- Add enrollment columns to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS enrollment_key uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS enrollment_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS enrollment_expires_at timestamp with time zone DEFAULT NULL;

-- Add registration_method to devices to track how they were created
ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS registration_method text DEFAULT 'manual';
