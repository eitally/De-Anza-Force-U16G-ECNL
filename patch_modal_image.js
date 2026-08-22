import fs from 'fs';
let content = fs.readFileSync('src/components/PlayerModal.tsx', 'utf8');

content = content.replace(
  'aspect-square md:aspect-auto md:h-full',
  'h-64 sm:h-80 md:aspect-auto md:h-full'
);

fs.writeFileSync('src/components/PlayerModal.tsx', content);
