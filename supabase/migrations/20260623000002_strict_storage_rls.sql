-- Ensure storage policies correctly match the path format documents/{userId}/filename.pdf
-- and also ensure they handle guest sessions in documents/guest/{guestSessionId}/filename.pdf

DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anon Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Updates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;

-- Allow public read access to all files in the documents bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Allow authenticated users to upload to documents/{userId}/*
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'documents' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow anon users (guests) to upload to documents/guest/*
CREATE POLICY "Anon Uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'documents' AND
  (storage.foldername(name))[2] = 'guest'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated Updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'documents' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated Deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'documents' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
