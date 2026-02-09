
CREATE TABLE IF NOT EXISTS public.ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Configuração do Prompt
  name VARCHAR(255) NOT NULL DEFAULT 'Configuração Padrão',
  system_prompt TEXT NOT NULL,
  knowledge_base TEXT NOT NULL DEFAULT '',

  -- Configuração do Modelo
  model VARCHAR(100) NOT NULL DEFAULT 'llama3.2:1b',
  temperature DECIMAL(3,2) DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 50,

  -- Configuração do Avatar
  avatar_name VARCHAR(100) DEFAULT 'Assistente',
  voice VARCHAR(50) DEFAULT 'af_bella',

  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_ai_configs_org ON public.ai_configs(org_id);
CREATE INDEX idx_ai_configs_active ON public.ai_configs(is_active);

-- Trigger para updated_at (reutiliza função existente)
CREATE TRIGGER update_ai_configs_updated_at
  BEFORE UPDATE ON public.ai_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

-- Super admins
CREATE POLICY "Super admins can manage all ai_configs"
  ON public.ai_configs FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all ai_configs"
  ON public.ai_configs FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Org admins
CREATE POLICY "Org admins can view their ai_configs"
  ON public.ai_configs FOR SELECT
  USING (org_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "Org admins can manage their ai_configs"
  ON public.ai_configs FOR ALL
  USING (org_id = public.get_user_org_id(auth.uid()));
