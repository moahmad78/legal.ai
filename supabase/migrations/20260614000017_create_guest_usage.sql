CREATE TABLE IF NOT EXISTS guest_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_session_id VARCHAR NOT NULL UNIQUE,
  chat_count INT DEFAULT 0,
  document_count INT DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_session_id ON guest_usage(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_guest_last_activity ON guest_usage(last_activity);
