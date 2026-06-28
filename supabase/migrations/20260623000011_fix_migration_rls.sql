-- Drop old select/update policies for authenticated users
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.documents;

-- Recreate select/update policies allowing authenticated users to access guest/unassigned documents during migration
CREATE POLICY "Enable select for authenticated users" 
ON public.documents FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Enable update for authenticated users" 
ON public.documents FOR UPDATE TO authenticated 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
