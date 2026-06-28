-- Add language detection columns to documents table
ALTER TABLE documents 
  ADD COLUMN original_language_code TEXT,
  ADD COLUMN original_language_name TEXT,
  ADD COLUMN language_confidence FLOAT;

-- Add user preference columns to users table
ALTER TABLE users 
  ADD COLUMN preferred_language_code TEXT,
  ADD COLUMN preferred_language_name TEXT;
