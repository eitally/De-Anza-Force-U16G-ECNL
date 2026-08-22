import fs from 'fs';
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  'className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-[#00ADEF] hover:from-blue-500 hover:to-[#33beff] border border-blue-400/40 transition-all shadow-md shadow-blue-950/40 group active:scale-95 cursor-pointer"',
  'className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-[#00ADEF] hover:from-blue-500 hover:to-[#33beff] border border-blue-400/40 transition-all shadow-md shadow-blue-950/40 group active:scale-95 cursor-pointer"'
);

fs.writeFileSync('src/components/Navbar.tsx', content);
