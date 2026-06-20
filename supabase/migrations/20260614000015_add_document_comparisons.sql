-- Create document_comparisons table
CREATE TABLE document_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  base_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  target_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  base_name TEXT NOT NULL,
  target_name TEXT NOT NULL,
  comparison_data JSONB NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_document_comparisons_matter_id ON document_comparisons(matter_id);
CREATE INDEX idx_document_comparisons_base_doc ON document_comparisons(base_document_id);
CREATE INDEX idx_document_comparisons_target_doc ON document_comparisons(target_document_id);
