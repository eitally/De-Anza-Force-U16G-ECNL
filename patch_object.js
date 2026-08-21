import fs from 'fs';
let content = fs.readFileSync('src/components/ActionCarousel.tsx', 'utf8');

content = content.replace(
  /className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-105"/,
  'className="w-full h-full object-contain object-center transition-all duration-700 ease-out transform group-hover:scale-105 bg-black/5 dark:bg-black/40"'
);

fs.writeFileSync('src/components/ActionCarousel.tsx', content);
