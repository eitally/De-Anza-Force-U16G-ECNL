import fs from 'fs';
let content = fs.readFileSync('src/components/ActionCarousel.tsx', 'utf8');

// Modify the view 1 container to expand
content = content.replace(
  /<div \n\s*className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800\/90 shadow-2xl group select-none"/,
  `<div 
          className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 shadow-2xl group select-none flex-1 flex flex-col"`
);

// Modify the image box to expand instead of fixed aspect ratio
content = content.replace(
  /<div className="relative w-full aspect-\[16\/10\] sm:aspect-\[16\/9\] overflow-hidden bg-white dark:bg-slate-900">/,
  `<div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:flex-1 overflow-hidden bg-white dark:bg-slate-900">`
);

fs.writeFileSync('src/components/ActionCarousel.tsx', content);
