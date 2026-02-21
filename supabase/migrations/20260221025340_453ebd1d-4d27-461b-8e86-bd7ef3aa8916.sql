-- Create public bucket for canvas images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('canvas-images', 'canvas-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload canvas images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'canvas-images');

-- Allow public read access
CREATE POLICY "Public read access for canvas images"
ON storage.objects FOR SELECT
USING (bucket_id = 'canvas-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete canvas images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'canvas-images');