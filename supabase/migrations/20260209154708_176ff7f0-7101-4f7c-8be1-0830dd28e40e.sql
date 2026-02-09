
-- Add AI prompt column to devices table (per-device, per-client)
ALTER TABLE public.devices
ADD COLUMN ai_prompt TEXT DEFAULT NULL;

COMMENT ON COLUMN public.devices.ai_prompt IS 'Prompt de IA personalizado para este dispositivo específico';
