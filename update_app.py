import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<p className="text-slate-500 dark:text-slate-400">{teamInfo.facilityAddress}</p>',
    '<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teamInfo.homeFacility + " " + teamInfo.facilityAddress)}`} target="_blank" rel="noopener noreferrer" className="block text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:underline">{teamInfo.facilityAddress}</a>'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
