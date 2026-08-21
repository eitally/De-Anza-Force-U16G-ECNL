import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<Navbar\n\s*teamInfo=\{teamInfo\}/,
  '<Navbar\n        masterAlbumInfo={masterAlbumInfo}\n        teamInfo={teamInfo}'
);

fs.writeFileSync('src/App.tsx', content);
