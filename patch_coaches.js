import fs from 'fs';
let content = fs.readFileSync('src/components/CoachingStaff.tsx', 'utf8');

content = content.replace(
  '<div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">',
  '<div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">'
);

content = content.replace(
  '<div className="relative h-60 w-full overflow-hidden bg-slate-50 dark:bg-slate-950">',
  '<div className="relative h-48 sm:h-56 lg:h-60 w-full overflow-hidden bg-slate-50 dark:bg-slate-950">'
);

content = content.replace(
  /<h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white leading-tight">/g,
  '<h3 className="font-condensed font-black text-base sm:text-xl uppercase text-slate-900 dark:text-white leading-tight">'
);

content = content.replace(
  /className="p-4"/g,
  'className="p-3 sm:p-4"'
);

content = content.replace(
  /<span className="px-2.5 py-1 rounded-md text-\[10px\]/g,
  '<span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px]'
);

fs.writeFileSync('src/components/CoachingStaff.tsx', content);
