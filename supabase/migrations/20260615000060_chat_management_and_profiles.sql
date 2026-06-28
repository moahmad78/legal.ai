-- Add Profile Fields to Users Table
ALTER TABLE users
ADD COLUMN avatar_url TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN designation TEXT,
ADD COLUMN bio TEXT,
ADD COLUMN timezone TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN language TEXT DEFAULT 'en';

-- Add Chat Management Fields to Assistant Conversations Table
ALTER TABLE assistant_conversations
ADD COLUMN is_pinned BOOLEAN DEFAULT false,
ADD COLUMN is_archived BOOLEAN DEFAULT false,
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_is_pinned ON assistant_conversations(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_is_archived ON assistant_conversations(is_archived);
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_client_id ON assistant_conversations(client_id);
