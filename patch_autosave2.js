import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

content = content.replace(
  /\/\/ Auto-save any in-progress photo edits/,
  `// Auto-save any in-progress photo addition
    let finalPhotos = [...localPhotos];
    if (isAddingPhoto && newPhotoUrl.trim()) {
      finalPhotos = [
        {
          id: \`photo_\${Date.now()}\`,
          url: newPhotoUrl.trim(),
          title: newPhotoTitle.trim() || 'Match Action Highlight',
          subtitle: newPhotoSubtitle.trim() || 'De Anza Force U16 ECNL Matchday Play',
          tag: newPhotoTag.trim() || 'Matchday Action',
          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        },
        ...finalPhotos
      ];
      setNewPhotoUrl('');
      setNewPhotoTitle('');
      setNewPhotoSubtitle('');
      setNewPhotoTag('');
      setIsAddingPhoto(false);
    }
    
    // Auto-save any in-progress photo edits`
);

fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
