-- Migration: enforce_rls_policies
-- Description: Enforces strict organization isolation using Row-Level Security

-- Create a helper function to extract x-org-id from PostgREST headers
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS TEXT AS $$
DECLARE
  headers JSON;
  org_id TEXT;
BEGIN
  -- PostgREST sets this setting per request
  headers := current_setting('request.headers', true)::JSON;
  org_id := headers->>'x-org-id';
  RETURN org_id;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 1. Enable RLS on core tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for Organization Isolation
-- For `clients`
CREATE POLICY "clients_org_isolation" ON clients
  AS PERMISSIVE FOR ALL
  USING (organization_id = get_current_org_id());

-- For `matters`
CREATE POLICY "matters_org_isolation" ON matters
  AS PERMISSIVE FOR ALL
  USING (organization_id = get_current_org_id());

-- For `documents`
CREATE POLICY "documents_org_isolation" ON documents
  AS PERMISSIVE FOR ALL
  USING (organization_id = get_current_org_id());

-- For `generated_reports`
CREATE POLICY "reports_org_isolation" ON generated_reports
  AS PERMISSIVE FOR ALL
  USING (organization_id = get_current_org_id());

-- For `assistant_conversations`
-- We allow guest access where user_id matches or organization_id matches
-- But strictly, guests shouldn't see saved chats from orgs.
-- The user requested: "Guest conversations remain temporary and expire"
-- We assume guests have an organization_id of 'guest', or they just can't see org chats.
CREATE POLICY "assistant_conversations_org_isolation" ON assistant_conversations
  AS PERMISSIVE FOR ALL
  USING (
    organization_id = get_current_org_id() 
    OR (get_current_org_id() = 'guest' AND mode = 'general' AND user_id::text = current_setting('request.headers', true)::JSON->>'x-guest-id')
  );

-- For `assistant_messages`
-- Inherit access from assistant_conversations
CREATE POLICY "assistant_messages_isolation" ON assistant_messages
  AS PERMISSIVE FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM assistant_conversations
    )
  );

-- For `client_timeline`
CREATE POLICY "client_timeline_org_isolation" ON client_timeline
  AS PERMISSIVE FOR ALL
  USING (client_id IN (SELECT id FROM clients));

-- For `client_notes`
CREATE POLICY "client_notes_org_isolation" ON client_notes
  AS PERMISSIVE FOR ALL
  USING (client_id IN (SELECT id FROM clients));

-- For `client_preferences`
CREATE POLICY "client_preferences_org_isolation" ON client_preferences
  AS PERMISSIVE FOR ALL
  USING (client_id IN (SELECT id FROM clients));
