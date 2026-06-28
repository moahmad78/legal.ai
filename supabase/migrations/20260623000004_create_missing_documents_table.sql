-- Create documents table if it is completely missing
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  file_name text,
  file_path text,
  file_size bigint,
  file_type text,
  upload_status text DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now()
);

-- 5. Add proper foreign key if users table exists.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE public.documents 
        ADD CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES public.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Add RLS policies for authenticated users.
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own documents" 
ON public.documents FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own documents" 
ON public.documents FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
