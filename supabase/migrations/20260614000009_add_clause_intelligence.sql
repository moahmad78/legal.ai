-- Create document_clauses table
CREATE TABLE IF NOT EXISTS document_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  clause_type TEXT NOT NULL,
  original_text TEXT NOT NULL,
  simple_meaning TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  business_impact TEXT NOT NULL,
  negotiation_suggestion TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for document_clauses
CREATE INDEX IF NOT EXISTS idx_document_clauses_document_id ON document_clauses(document_id);
CREATE INDEX IF NOT EXISTS idx_document_clauses_clause_type ON document_clauses(clause_type);
CREATE INDEX IF NOT EXISTS idx_document_clauses_risk_level ON document_clauses(risk_level);
CREATE INDEX IF NOT EXISTS idx_document_clauses_confidence ON document_clauses(confidence);
