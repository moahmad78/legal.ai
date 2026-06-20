-- Add risk intelligence fields to documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS overall_risk_score INTEGER,
  ADD COLUMN IF NOT EXISTS overall_risk_level TEXT,
  ADD COLUMN IF NOT EXISTS risk_confidence INTEGER,
  ADD COLUMN IF NOT EXISTS risk_completed_at TIMESTAMP WITH TIME ZONE;

-- Add new fields to reports table
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS heatmap JSONB,
  ADD COLUMN IF NOT EXISTS missing_clauses JSONB,
  ADD COLUMN IF NOT EXISTS recommended_actions JSONB;


-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_documents_overall_risk_level ON documents(overall_risk_level);
CREATE INDEX IF NOT EXISTS idx_documents_overall_risk_score ON documents(overall_risk_score);

-- Create document_risks table
CREATE TABLE IF NOT EXISTS document_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  affected_clause TEXT,
  description TEXT NOT NULL,
  business_impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for document_risks
CREATE INDEX IF NOT EXISTS idx_document_risks_document_id ON document_risks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_risks_severity ON document_risks(severity);
CREATE INDEX IF NOT EXISTS idx_document_risks_confidence ON document_risks(confidence);
