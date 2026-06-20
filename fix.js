const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/chat/[documentId]/route.ts',
  'src/app/api/chat/client/[clientId]/route.ts',
  'src/app/api/chat/general/route.ts',
  'src/app/api/chat/migrate/route.ts',
  'src/app/(app)/pricing/pricing/page.tsx',
  'src/app/(app)/reports/[reportId]/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/(app)/settings/audit/page.tsx'
];

for (const file of files) {
  const p = path.join('d:/legal', file);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/const \{ data: user \} = await supabase(1?)\.from/g, 'const { data: dbUser } = await supabase.from');
  content = content.replace(/if \(!user\)/g, 'if (!dbUser)');
  content = content.replace(/const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);/g, 'const { data: { user } } = await supabase.auth.getUser();\n'); // keep it intact
  fs.writeFileSync(p, content);
  console.log('Fixed', file);
}
