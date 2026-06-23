CREATE TABLE public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid,
  plan text DEFAULT 'free',
  period_start timestamptz,
  period_end timestamptz,
  chat_count integer DEFAULT 0,
  document_count integer DEFAULT 0,
  report_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users based on user_id" 
ON public.user_usage FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Enable insert for users based on user_id" 
ON public.user_usage FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for users based on user_id" 
ON public.user_usage FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
