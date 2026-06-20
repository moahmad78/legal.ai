CREATE TABLE matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  matter_name TEXT NOT NULL,
  matter_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  internal_notes TEXT,
  assigned_to TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_matters_client_id ON matters(client_id);
CREATE INDEX idx_matters_organization_id ON matters(organization_id);
CREATE INDEX idx_matters_status ON matters(status);
CREATE INDEX idx_matters_priority ON matters(priority);
CREATE INDEX idx_matters_assigned_to ON matters(assigned_to);
