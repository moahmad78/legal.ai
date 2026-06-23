-- Drop existing broken policies
DROP POLICY IF EXISTS "Public access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to documents" ON storage.objects;

-- Create proper policies for both authenticated and anon users
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'documents' );

CREATE POLICY "Anon Uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'documents' );

CREATE POLICY "Authenticated Updates"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'documents' );

CREATE POLICY "Authenticated Deletes"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'documents' );
