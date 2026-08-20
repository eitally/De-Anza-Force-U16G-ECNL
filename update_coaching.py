import re

with open('src/components/CoachingStaff.tsx', 'r') as f:
    content = f.read()

old_phone = """                <a
                  href={`tel:${coach.phone}`}
                  className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{coach.phone}</span>
                </a>"""

new_phone = """                {coach.phone && (
                  <a
                    href={`tel:${coach.phone}`}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{coach.phone}</span>
                  </a>
                )}"""

content = content.replace(old_phone, new_phone)

with open('src/components/CoachingStaff.tsx', 'w') as f:
    f.write(content)
