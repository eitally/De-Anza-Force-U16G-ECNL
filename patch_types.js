import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  /teamPhotoCaption\?: string;\n}/,
  "teamPhotoCaption?: string;\n  recentForm?: ('W' | 'D' | 'L' | '-')[];\n  recentFormStat?: string;\n}"
);

fs.writeFileSync('src/types.ts', content);
