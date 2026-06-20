const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/legal/src');
let changed = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/\.from\([\s\S]*?['"]users['"][\s\S]*?\)([\s\S]*?)\.eq\(['"]id['"],\s*(userId|user\.id)\)/g, (match, g1, g2) => {
    return match.replace(/['"]id['"]/, '"auth_user_id"');
  });
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Updated ' + f);
    changed++;
  }
});
console.log('Total files updated: ' + changed);
