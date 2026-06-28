-- 1. Drop existing foreign key on user_id if it exists
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

-- 2. Modify user_id to reference auth.users(id)
ALTER TABLE public.documents 
ADD CONSTRAINT documents_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Drop all existing RLS policies on documents to start fresh
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'documents'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.documents', pol.policyname);
    END LOOP;
END
$$;

-- 4. Create new RLS policies for documents table
-- Insert
CREATE POLICY "Enable insert for authenticated users" 
ON public.documents FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable insert for guest users" 
ON public.documents FOR INSERT TO anon 
WITH CHECK (user_id IS NULL);

-- Select
CREATE POLICY "Enable select for authenticated users" 
ON public.documents FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Enable select for guest users" 
ON public.documents FOR SELECT TO anon 
USING (user_id IS NULL);

-- Update
CREATE POLICY "Enable update for authenticated users" 
ON public.documents FOR UPDATE TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Enable update for guest users" 
ON public.documents FOR UPDATE TO anon 
USING (user_id IS NULL);

-- Delete
CREATE POLICY "Enable delete for authenticated users" 
ON public.documents FOR DELETE TO authenticated 
USING (user_id = auth.uid());


-- 5. Fix Storage Bucket RLS Policies for "documents" bucket
-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for documents bucket
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END
$$;

-- Create Storage Policies
CREATE POLICY "Auth users can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Guest users can upload to guest folder"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[2] = 'guest');

CREATE POLICY "Auth users can view own folder"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Guest users can view guest folder"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'documents' AND (storage.foldername(name))[2] = 'guest');

CREATE POLICY "Auth users can delete own folder"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
