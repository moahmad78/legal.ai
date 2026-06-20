-- Add analysis fields to documents table
ALTER TABLE documents 
ADD COLUMN document_type TEXT,
ADD COLUMN confidence_score INTEGER,
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN error_message TEXT;
