import fs from 'fs';
let content = fs.readFileSync('src/components/PlayerModal.tsx', 'utf8');

const closeBtn = `
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        {/* Scrollable Content */}`;

content = content.replace(
  /\{\/\* Modal Close Button \*\/\}\s*\{\/\* Scrollable Content \*\/\}/,
  closeBtn
);

fs.writeFileSync('src/components/PlayerModal.tsx', content);
