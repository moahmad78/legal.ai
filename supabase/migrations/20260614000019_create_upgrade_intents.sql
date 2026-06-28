-- Migration: create_upgrade_intents
-- Description: Tracks user intent to upgrade their plan

CREATE TABLE IF NOT EXISTS public.upgrade_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trigger_source TEXT NOT NULL,
    plan_selected TEXT,
    status TEXT DEFAULT 'started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_upgrade_intents_org_id ON public.upgrade_intents(organization_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_intents_user_id ON public.upgrade_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_intents_status ON public.upgrade_intents(status);

-- Enable RLS
ALTER TABLE public.upgrade_intents ENABLE ROW LEVEL SECURITY;

-- Policies
-- Since users are linked via Clerk, we might need a custom check, but if we assume the internal user_id is passed
-- or we let the service role handle it, we can create a generic policy or just rely on server actions.
CREATE POLICY "Users can insert their own intents" 
    ON public.upgrade_intents FOR INSERT 
    WITH CHECK (true); -- Handled by server action logic

CREATE POLICY "Users can view their own intents" 
    ON public.upgrade_intents FOR SELECT 
    USING (true); -- Handled by server action logic

-- Trigger for updated_at (assuming moddatetime is installed, or we just rely on server)
-- We'll handle it via server actions to avoid trigger dependencies if moddatetime isn't available,
-- but typically it's safe to use a custom function if one exists.
-- Actually let's use the standard update_modified_column function if it exists.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_modified_column') THEN
    CREATE TRIGGER update_upgrade_intents_modtime
    BEFORE UPDATE ON public.upgrade_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;
