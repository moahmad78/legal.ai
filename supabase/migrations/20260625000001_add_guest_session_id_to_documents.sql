ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS guest_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_documents_guest_session_id 
ON documents(guest_session_id);
