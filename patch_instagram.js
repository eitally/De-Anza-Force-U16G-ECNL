import fs from 'fs';
let content = fs.readFileSync('src/components/InstagramFeaturedPost.tsx', 'utf8');

// Undo the bad global replace
content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');

// Now, correctly replace only the button text color:
// bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-slate-900 dark:text-white
content = content.replace(
  'bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-slate-900 dark:text-white',
  'bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white'
);

content = content.replace(
  'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-slate-900 dark:text-white',
  'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
);

// Also need to fix hover:text-slate-900 dark:hover:text-white that might have been changed to hover:text-slate-900 dark:text-slate-900 dark:text-white
// Wait, my previous command was: sed -i 's/text-slate-900 dark:text-white/text-white/g'
// It didn't affect hover. Let's just double check the file.

fs.writeFileSync('src/components/InstagramFeaturedPost.tsx', content);
