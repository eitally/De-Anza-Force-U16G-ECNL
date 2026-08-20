import re

def process_action_carousel():
    with open('src/components/ActionCarousel.tsx', 'r') as f:
        content = f.read()

    # The lightbox has bg-black/95. It should force dark mode styles.
    # Replace all text-slate-900 dark:text-white with text-white where it matters.
    # Actually, let's just make it simple: in ActionCarousel.tsx, text-slate-900 dark:text-white -> text-white
    content = content.replace('text-slate-900 dark:text-white', 'text-white')
    content = content.replace('text-slate-900 dark:hover:text-white', 'hover:text-white')
    content = content.replace('bg-white dark:bg-slate-900 hover:bg-red-600', 'bg-slate-900 hover:bg-red-600')
    content = content.replace('text-slate-600 dark:text-slate-300', 'text-slate-300')
    content = content.replace('border-slate-200 dark:border-slate-800', 'border-slate-800')
    content = content.replace('border-slate-300 dark:border-slate-700/80', 'border-slate-700/80')
    content = content.replace('border-slate-300 dark:border-slate-700', 'border-slate-700')
    content = content.replace('text-slate-500 dark:text-slate-400', 'text-slate-400')
    
    # Fix the activeTab buttons if they got messed up, but wait - the non-overlay parts might need light/dark mode.
    # The activeTab buttons are at the top, they are NOT on the black background. 
    # Let's revert everything in ActionCarousel, then re-apply light/dark ONLY to the top tabs and album list.
    pass

# Instead of blindly replacing, let's just do targeted replacements in ActionCarousel.tsx
with open('src/components/ActionCarousel.tsx', 'r') as f:
    ac_content = f.read()

# Fix Lightbox Text
ac_content = re.sub(r'(<div className="fixed inset-0 z-50 bg-black/95.*?</button>\s*</div>\s*</div>\s*</div>\s*)}', lambda m: m.group(0).replace('text-slate-900 dark:text-white', 'text-white').replace('text-slate-600 dark:text-slate-300', 'text-slate-300').replace('text-slate-500 dark:text-slate-400', 'text-slate-400').replace('border-slate-200 dark:border-slate-800', 'border-slate-800').replace('bg-white dark:bg-slate-900', 'bg-slate-900'), ac_content, flags=re.DOTALL)

# Fix overlay text (e.g. caption on slide, next/prev buttons)
ac_content = ac_content.replace('bg-black/60 hover:bg-blue-600 text-slate-900 dark:text-white', 'bg-black/60 hover:bg-blue-600 text-white')
ac_content = ac_content.replace('text-lg sm:text-2xl text-slate-900 dark:text-white', 'text-lg sm:text-2xl text-white')
ac_content = ac_content.replace('text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-black/60', 'text-[10px] font-bold text-slate-300 hover:text-white bg-black/60')

with open('src/components/ActionCarousel.tsx', 'w') as f:
    f.write(ac_content)

# Fix Hero.tsx next fixture spotlight
with open('src/components/Hero.tsx', 'r') as f:
    hero_content = f.read()

hero_content = hero_content.replace(
    'bg-gradient-to-b from-[#11192e] to-[#0a0f1d] border border-blue-900/50',
    'bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50'
)

with open('src/components/Hero.tsx', 'w') as f:
    f.write(hero_content)

