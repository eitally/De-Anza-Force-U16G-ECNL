import re

with open('src/components/PlayerCard.tsx', 'r') as f:
    content = f.read()

content = content.replace('group-hover:text-blue-600 dark:text-blue-400', 'group-hover:text-blue-600 dark:group-hover:text-blue-400')
content = content.replace('group-hover:text-blue-300', 'group-hover:text-blue-700 dark:group-hover:text-blue-300')
content = content.replace('text-red-600 dark:text-red-400 hover:text-red-300', 'text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300')
content = content.replace('text-pink-400 hover:text-pink-300', 'text-pink-500 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300')

with open('src/components/PlayerCard.tsx', 'w') as f:
    f.write(content)
