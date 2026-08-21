import fs from 'fs';
let content = fs.readFileSync('src/components/ActionCarousel.tsx', 'utf8');

content = content.replace(
  /<div className="relative w-full aspect-\[16\/10\] sm:aspect-\[16\/9\] lg:aspect-auto lg:h-full lg:flex-1 overflow-hidden bg-white dark:bg-slate-900">/,
  '<div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:absolute lg:inset-0 overflow-hidden bg-white dark:bg-slate-900">'
);

fs.writeFileSync('src/components/ActionCarousel.tsx', content);
