import fs from 'fs';
let content = fs.readFileSync('src/data/defaultData.ts', 'utf8');

content = content.replace(
  /"teamPhotoCaption": "2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff"\n};/,
  `"teamPhotoCaption": "2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff",\n  "recentForm": ["W", "W", "D", "W", "L"],\n  "recentFormStat": "3 Clean Sheets in last 5 matches"\n};`
);

fs.writeFileSync('src/data/defaultData.ts', content);
