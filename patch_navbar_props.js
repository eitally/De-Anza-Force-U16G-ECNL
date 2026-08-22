import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /<Navbar([^>]*?)isAdminMode=\{isAdminMode\}([^>]*?)\/>/g,
  '<Navbar$1$2/>'
);
fs.writeFileSync('src/App.tsx', content);
