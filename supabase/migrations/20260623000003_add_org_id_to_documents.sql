-- Add organization_id to documents to match RLS policies
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
