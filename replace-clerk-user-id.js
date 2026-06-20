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
    if (content.includes('clerk_user_id') || content.includes('clerkUserId')) {
      let newContent = content.replace(/['"]clerk_user_id['"]/g, '"id"');
      // replace clerkUserId with userId
      newContent = newContent.replace(/clerkUserId/g, 'userId');
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated', filePath);
      }
    }
  }
});
