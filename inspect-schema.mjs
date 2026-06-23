import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptytdeeakndffksyhpyf.supabase.co',
  'sb_publishable_ZZRMjF4K5euGtVVlmc35IQ_MGQV2Y9s'
);

async function checkUser() {
  console.log('\\n--- CHECKING USER ---');
  const { data, error } = await supabase.from('users').select('*').eq('auth_user_id', 'eecbd46d-b9a6-416d-b041-49a58f6fe777');
  console.log('User query result:', data);
  if (error) console.error('User query error:', error);
}

checkUser();
