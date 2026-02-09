
-- Add optional device_id to ai_configs to allow linking a config to a specific device
ALTER TABLE public.ai_configs ADD COLUMN device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_ai_configs_device_id ON public.ai_configs(device_id);
