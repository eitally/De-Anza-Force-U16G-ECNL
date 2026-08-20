import re

with open('src/components/PlayerCard.tsx', 'r') as f:
    content = f.read()

# Change card root background
content = content.replace(
    'bg-gradient-to-b from-[#101726] to-[#0a0e1a]',
    'bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:to-[#0a0e1a]'
)

# Fix PDF button
content = content.replace(
    'text-blue-300 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded-lg bg-blue-950/80 hover:bg-blue-600 border border-blue-700/60',
    'text-blue-700 dark:text-blue-300 hover:text-white px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-600 border border-blue-200 dark:border-blue-700/60'
)
content = content.replace('<FileDown className="w-3.5 h-3.5 text-blue-300" />', '<FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />')

# Fix GPA badge
content = content.replace(
    'text-blue-300 font-semibold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40',
    'text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/40'
)
content = content.replace('<GraduationCap className="w-3 h-3 text-blue-400" />', '<GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />')

# Fix stats
content = content.replace('text-emerald-400', 'text-emerald-600 dark:text-emerald-400')
content = content.replace('text-cyan-300', 'text-cyan-600 dark:text-cyan-300')
content = content.replace('text-blue-400', 'text-blue-600 dark:text-blue-400')
content = content.replace('text-red-400', 'text-red-600 dark:text-red-400')

with open('src/components/PlayerCard.tsx', 'w') as f:
    f.write(content)
