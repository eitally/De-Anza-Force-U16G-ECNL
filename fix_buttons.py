import re

with open('src/components/PlayerModal.tsx', 'r') as f:
    content = f.read()

# Fix text-slate-900 dark:text-white inside buttons with strong backgrounds
content = content.replace('bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white', 'bg-emerald-600 hover:bg-emerald-500 text-white')
content = content.replace('bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white', 'bg-red-600 hover:bg-red-500 text-white')
content = content.replace('hover:opacity-90 text-slate-900 dark:text-white', 'hover:opacity-90 text-white')
content = content.replace('bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white', 'bg-blue-600 hover:bg-blue-500 text-white')

with open('src/components/PlayerModal.tsx', 'w') as f:
    f.write(content)

