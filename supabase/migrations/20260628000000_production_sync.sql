-- Comprehensive Production Schema Sync
-- Ensures all columns referenced by the codebase exist in the Supabase schema.

-- 1. Ensure user_usage has necessary tracking columns
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS document_count INTEGER DEFAULT 0;
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- 2. Ensure documents has missing columns
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS guest_session_id TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS organization_id UUID;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id UUID;

-- 3. Ensure users table has active_organization_id
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active_organization_id UUID;

-- 4. Reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
