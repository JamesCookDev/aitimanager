ALTER TABLE public.ai_configs ADD COLUMN llm_url text DEFAULT NULL;
ALTER TABLE public.ai_configs ADD COLUMN tts_speed numeric DEFAULT 1;
ALTER TABLE public.ai_configs ADD COLUMN tts_model character varying DEFAULT 'kokoro';