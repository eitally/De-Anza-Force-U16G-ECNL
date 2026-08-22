import fs from 'fs';
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

content = content.replace(
  '<div className="relative rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-3.5 shadow-md overflow-hidden group">',
  '<div className="relative w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-3.5 shadow-md overflow-hidden group">'
);

fs.writeFileSync('src/components/Hero.tsx', content);
