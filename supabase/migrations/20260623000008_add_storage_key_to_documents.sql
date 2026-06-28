-- Add storage_key column if it doesn't exist
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS storage_key text;

-- Backfill existing records
UPDATE public.documents
SET storage_key = substring(file_path from '/public/documents/(.*)$')
WHERE storage_key IS NULL AND file_path LIKE '%/public/documents/%';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
