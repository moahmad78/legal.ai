-- Add mode column to assistant_conversations
ALTER TABLE assistant_conversations 
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'general' CHECK (mode IN ('general', 'document'));

-- Update existing records
UPDATE assistant_conversations 
SET mode = 'document' 
WHERE document_id IS NOT NULL;

-- Create index on mode
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_mode ON assistant_conversations(mode);
