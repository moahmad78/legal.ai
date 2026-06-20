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
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@clerk/nextjs')) {
      // For client components only using useAuth, useUser
      let newContent = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@clerk\/nextjs['"]/g, 'import { $1 } from "@/components/auth/AuthProvider"');
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated', filePath);
      }
    }
  }
});
