import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

// Add state
content = content.replace(
  /const \[isAddingPhoto, setIsAddingPhoto\] = useState\(false\);/,
  `const [isAddingPhoto, setIsAddingPhoto] = useState(false);\n  const [isDragOverPhotos, setIsDragOverPhotos] = useState(false);`
);

// Add drag handlers
const dragHandlers = `
  const handlePhotosDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPhotos(true);
  };
  const handlePhotosDragLeave = () => setIsDragOverPhotos(false);
  const handlePhotosDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPhotos(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    
    showNotification(\`Processing \${files.length} photo(s)...\`);
    
    const newPhotos: ActionPhoto[] = [];
    for (const file of files) {
      try {
        const compressedUrl = await compressImage(file, 1000, 0.7);
        newPhotos.push({
          id: \`photo_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`,
          url: compressedUrl,
          title: 'Match Action Highlight',
          subtitle: 'De Anza Force U16 ECNL Matchday Play',
          tag: 'Matchday Action',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
      } catch (err) {
        console.error("Failed to compress photo", err);
      }
    }
    
    if (newPhotos.length > 0) {
      const updated = [...newPhotos, ...localPhotos];
      saveMedia(updated, localAlbums, localMasterAlbum);
      showNotification(\`✓ Added \${newPhotos.length} action photo(s) to carousel!\`);
    }
  };
`;

content = content.replace(
  /\/\/ Action Photos Handlers/,
  `// Action Photos Handlers${dragHandlers}`
);

// Add drop zone to SECTION 3
content = content.replace(
  /\{\/\* SECTION 3: ACTION CAROUSEL PHOTOS \*\/\}\n\s*<div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">/,
  `{/* SECTION 3: ACTION CAROUSEL PHOTOS */}
              <div 
                className={\`space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 relative rounded-2xl \${isDragOverPhotos ? 'bg-blue-900/20 border-blue-500/50 p-4 ring-2 ring-blue-500' : ''}\`}
                onDragOver={handlePhotosDragOver}
                onDragLeave={handlePhotosDragLeave}
                onDrop={handlePhotosDrop}
              >
                {isDragOverPhotos && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-500 pointer-events-none">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-[#00ADEF] mx-auto mb-3 animate-bounce" />
                      <h3 className="font-condensed font-black text-2xl text-white uppercase tracking-wider">Drop Photos to Add</h3>
                      <p className="text-sm text-slate-300">Images will be automatically compressed and saved</p>
                    </div>
                  </div>
                )}`
);

fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
