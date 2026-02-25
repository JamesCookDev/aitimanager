
-- Table to store form submissions from totem devices
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  form_title TEXT,
  fields JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view their form submissions"
  ON public.form_submissions FOR SELECT
  USING (org_id = get_user_org_id(auth.uid()));

CREATE POLICY "Super admins can view all form submissions"
  ON public.form_submissions FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all form submissions"
  ON public.form_submissions FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow anonymous inserts (totem devices submit without auth)
CREATE POLICY "Anyone can insert form submissions"
  ON public.form_submissions FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_form_submissions_org ON public.form_submissions(org_id);
CREATE INDEX idx_form_submissions_device ON public.form_submissions(device_id);
