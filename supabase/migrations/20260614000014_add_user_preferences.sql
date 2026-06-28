-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  has_seen_welcome BOOLEAN DEFAULT FALSE,
  welcome_dismissed BOOLEAN DEFAULT FALSE,
  checklist_progress JSONB DEFAULT '{"ask_ai": false, "upload_document": false, "create_client": false, "create_matter": false, "generate_report": false}'::jsonb,
  recent_activity JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
