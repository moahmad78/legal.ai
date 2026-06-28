-- Add document_count to user_usage table if not exists
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS document_count INTEGER DEFAULT 0;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
