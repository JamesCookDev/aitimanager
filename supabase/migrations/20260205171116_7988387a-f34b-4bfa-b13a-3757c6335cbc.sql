-- Adicionar campos de configuração do avatar aos dispositivos
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{
  "colors": {
    "shirt": "#1E3A8A",
    "pants": "#1F2937",
    "shoes": "#000000"
  },
  "material": {
    "metalness": 0.1,
    "roughness": 0.8
  },
  "animation": "idle"
}'::jsonb,
ADD COLUMN IF NOT EXISTS model_3d_url TEXT,
ADD COLUMN IF NOT EXISTS is_speaking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_interaction TIMESTAMP WITH TIME ZONE;

-- Adicionar campo de status detalhado
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS status_details JSONB DEFAULT '{}'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN public.devices.avatar_config IS 'Configurações visuais do avatar (cores, materiais, animação)';
COMMENT ON COLUMN public.devices.model_3d_url IS 'URL do modelo 3D customizado (.glb)';
COMMENT ON COLUMN public.devices.is_speaking IS 'Indica se o avatar está falando no momento';
COMMENT ON COLUMN public.devices.last_interaction IS 'Timestamp da última interação do usuário com o totem';
COMMENT ON COLUMN public.devices.status_details IS 'Detalhes adicionais de status (versão, métricas, etc)';