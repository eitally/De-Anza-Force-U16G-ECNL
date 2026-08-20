import re

with open('src/components/PlayerModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">',
    '<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">'
)

content = content.replace(
    '<div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">\n                  <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Player Contact</div>',
    '<div className="col-span-2 p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">\n                  <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Player Contact</div>'
)

with open('src/components/PlayerModal.tsx', 'w') as f:
    f.write(content)
