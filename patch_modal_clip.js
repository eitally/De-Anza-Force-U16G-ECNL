import fs from 'fs';
let content = fs.readFileSync('src/components/PlayerModal.tsx', 'utf8');

const target = 'className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0b101d] border border-blue-900/60 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"\n        onClick={(e) => e.stopPropagation()}';

const replacement = 'className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0b101d] border border-blue-900/60 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"\n        style={{ WebkitMaskImage: \'-webkit-radial-gradient(white, black)\' }}\n        onClick={(e) => e.stopPropagation()}';

content = content.replace(target, replacement);

fs.writeFileSync('src/components/PlayerModal.tsx', content);
