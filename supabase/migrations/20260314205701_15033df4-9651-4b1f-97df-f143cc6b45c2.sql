
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-dist', 'agent-dist', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for agent-dist"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agent-dist');

CREATE POLICY "Admins can upload agent-dist"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-dist');
