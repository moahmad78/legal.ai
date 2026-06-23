-- Add missing columns to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS upload_status text DEFAULT 'uploaded';

-- Ensure users table exists so we don't get PGRST205 for users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id text,
  email text,
  full_name text,
  plan text DEFAULT 'free',
  active_organization_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Safely add foreign key to documents
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'documents_user_id_fkey') THEN
        ALTER TABLE public.documents 
        ADD CONSTRAINT documents_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Reload schema cache to fix PGRST204/PGRST205 errors
NOTIFY pgrst, 'reload schema';
