const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('d:/legal/src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@clerk/nextjs/server')) {
      let newContent = content;

      // 1. Remove clerk import
      newContent = newContent.replace(/import\s+\{\s*auth\s*\}\s+from\s+['"]@clerk\/nextjs\/server['"];?\n?/g, '');
      
      // 2. Ensure createClient is imported from supabase if needed
      if (!newContent.includes('@/lib/supabase/server') && newContent.includes('await auth()')) {
        newContent = 'import { createClient } from "@/lib/supabase/server";\n' + newContent;
      }

      // 3. Replace auth() with supabase call
      // Pattern: const { userId } = await auth();
      // Replace with:
      // const supabase = await createClient();
      // const { data: { user } } = await supabase.auth.getUser();
      // const userId = user?.id;
      
      newContent = newContent.replace(
        /const\s+\{\s*userId\s*\}\s*=\s*await\s+auth\(\)\s*;/g,
        'const supabase = await createClient();\n  const { data: { user } } = await supabase.auth.getUser();\n  const userId = user?.id;'
      );

      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated', filePath);
      }
    }
  }
});
