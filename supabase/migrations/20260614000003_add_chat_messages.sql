-- Drop the old table if it exists (since we haven't used it yet)
DROP TABLE IF EXISTS chat_messages;

-- Create the new chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add extracted_text to reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Add indexes
CREATE INDEX idx_chat_messages_document_id ON chat_messages(document_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
