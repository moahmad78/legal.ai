-- Add document_count and organization_id to user_usage table if they don't exist
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS document_count INTEGER DEFAULT 0;
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
