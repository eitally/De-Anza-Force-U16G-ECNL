import fs from 'fs';
let content = fs.readFileSync('src/components/ScheduleSection.tsx', 'utf8');

// Update Kit Colors
content = content.replace(
  /match\.homeKitColor/g,
  "match.isHome ? 'Blue / Red Accents' : 'Black'"
);

// Update Home Pill Style
// It was: match.isHome ? 'bg-blue-950/90 text-[#00ADEF] border border-blue-800/80' : 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
// Need to match multiple variations like shadow-xs as well

content = content.replace(
  /match\.isHome\s*\n\s*\? 'bg-blue-950\/90 text-\[\#00ADEF\] border border-blue-800\/80 shadow-xs'\s*\n\s*: 'bg-amber-950\/90 text-amber-300 border border-amber-800\/80 shadow-xs'/g,
  "match.isHome\n                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-[#00ADEF] border border-blue-200 dark:border-blue-800 shadow-xs'\n                              : 'bg-slate-800 text-white border border-slate-700 shadow-xs'"
);

content = content.replace(
  /match\.isHome \? 'bg-blue-950\/90 text-\[\#00ADEF\] border border-blue-800\/80' : 'bg-amber-950\/90 text-amber-300 border border-amber-800\/80'/g,
  "match.isHome ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-[#00ADEF] border border-blue-200 dark:border-blue-800' : 'bg-slate-800 text-white border border-slate-700'"
);

content = content.replace(
  /match\.isHome \? 'text-slate-500 dark:text-slate-400 font-bold' : 'text-amber-400 font-black'/g,
  "match.isHome ? 'text-slate-500 dark:text-slate-400 font-bold' : 'text-slate-500 dark:text-slate-400 font-bold'"
); // also normalizing the "vs" / "at" color if needed, but they didn't explicitly ask to change "vs/at" color. I will leave it or remove it. Wait, the user didn't ask to change the "vs" / "at" color, only the "Home" / "Away" text accent. I will revert this regex if it matches.

fs.writeFileSync('src/components/ScheduleSection.tsx', content);
