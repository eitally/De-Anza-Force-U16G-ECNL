import re

with open('src/components/PlayerModal.tsx', 'r') as f:
    content = f.read()

content = content.replace('text-slate-600 dark:text-slate-300', 'text-slate-700 dark:text-slate-300')
content = content.replace('text-slate-500 dark:text-slate-400', 'text-slate-600 dark:text-slate-400')

with open('src/components/PlayerModal.tsx', 'w') as f:
    f.write(content)

