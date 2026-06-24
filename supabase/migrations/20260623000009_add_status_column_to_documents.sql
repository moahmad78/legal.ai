-- Add status column if it doesn't exist to prevent crash in analysis API and UI
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS status text DEFAULT 'uploaded';

-- Sync existing records
UPDATE public.documents
SET status = upload_status
WHERE status IS NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
