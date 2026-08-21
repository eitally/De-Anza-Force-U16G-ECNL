import fs from 'fs';
import path from 'path';

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        walk(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

const files = walk('src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Find lines with hover:bg-blue-600 and hover:text-slate-900 dark:hover:text-white
  // and replace hover:text-slate-900 dark:hover:text-white with hover:text-white
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('hover:bg-blue-600') || lines[i].includes('bg-blue-600')) {
      lines[i] = lines[i].replace(/hover:text-slate-900 dark:hover:text-white/g, 'hover:text-white');
    }
  }
  content = lines.join('\n');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated hover states in ${file}`);
  }
}
