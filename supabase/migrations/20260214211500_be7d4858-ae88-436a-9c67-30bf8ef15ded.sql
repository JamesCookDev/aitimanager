
-- Table for custom layout templates
CREATE TABLE public.layout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎨',
  description TEXT,
  layout JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.layout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view their templates"
  ON public.layout_templates FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org admins can create templates"
  ON public.layout_templates FOR INSERT
  WITH CHECK (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Org admins can delete their templates"
  ON public.layout_templates FOR DELETE
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Super admins can manage all templates"
  ON public.layout_templates FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));
