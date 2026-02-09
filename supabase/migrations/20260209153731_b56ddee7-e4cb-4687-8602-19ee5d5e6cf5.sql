
-- Create command_logs table for device command history
CREATE TABLE public.command_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  command TEXT NOT NULL,
  sent_by UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'expired'))
);

-- Enable RLS
ALTER TABLE public.command_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Super admins can manage all command logs"
  ON public.command_logs FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all command logs"
  ON public.command_logs FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Org admins can manage their device command logs"
  ON public.command_logs FOR ALL
  USING (device_id IN (
    SELECT id FROM devices WHERE org_id = get_user_org_id(auth.uid())
  ));

CREATE POLICY "Org admins can view their device command logs"
  ON public.command_logs FOR SELECT
  USING (device_id IN (
    SELECT id FROM devices WHERE org_id = get_user_org_id(auth.uid())
  ));

-- Index for fast lookups
CREATE INDEX idx_command_logs_device_id ON public.command_logs(device_id);
CREATE INDEX idx_command_logs_status ON public.command_logs(status);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.command_logs;
