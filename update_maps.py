import re

with open('src/components/ScheduleSection.tsx', 'r') as f:
    sched = f.read()

sched = sched.replace(
    '<span className="truncate text-xs font-semibold">{match.venue}</span>',
    '<a href={match.mapUrl} target="_blank" rel="noopener noreferrer" className="truncate text-xs font-semibold hover:text-blue-400 hover:underline">{match.venue}</a>'
)

sched = sched.replace(
    '<span className="truncate">{match.venue}</span>',
    '<a href={match.mapUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-400 hover:underline">{match.venue}</a>'
)

with open('src/components/ScheduleSection.tsx', 'w') as f:
    f.write(sched)

with open('src/components/Hero.tsx', 'r') as f:
    hero = f.read()

hero = hero.replace(
    '<span className="truncate">{nextMatch.venue}</span>',
    '<a href={nextMatch.mapUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-400 hover:underline">{nextMatch.venue}</a>'
)

with open('src/components/Hero.tsx', 'w') as f:
    f.write(hero)

