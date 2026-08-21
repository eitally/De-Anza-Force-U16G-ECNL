import fs from 'fs';

let content = fs.readFileSync('src/components/ActionCarousel.tsx', 'utf8');

const newHeader = `
      {/* Navigation Header */}
      {onOpenPhotoManager && (
        <div className="flex items-center justify-end mb-3 bg-white dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <button
            onClick={onOpenPhotoManager}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Manage media settings"
          >
            <Settings className="w-3 h-3" />
            <span>Manage Media</span>
          </button>
        </div>
      )}
`;

content = content.replace(
  /\{\/\* Navigation Header \*\/\}\s*<div className="flex items-center justify-between mb-3 bg-white[\s\S]*?<\/div>\s*\}\)\s*<\/div>/,
  newHeader.trim()
);

fs.writeFileSync('src/components/ActionCarousel.tsx', content);
