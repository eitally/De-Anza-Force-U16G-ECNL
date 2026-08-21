import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

content = content.replace(
  /saveMedia\(localPhotos, localAlbums, localMasterAlbum\);\n\s*showNotification\('✓ All team changes saved successfully!'\);/,
  `// Auto-save any in-progress photo edits
    let finalPhotos = [...localPhotos];
    if (editingPhoto) {
      finalPhotos = finalPhotos.map(p => p.id === editingPhoto.id ? editingPhoto : p);
      setEditingPhoto(null);
    }
    
    // Auto-save any in-progress album edits
    let finalAlbums = [...localAlbums];
    if (editingAlbum) {
      finalAlbums = finalAlbums.map(a => a.id === editingAlbum.id ? editingAlbum : a);
      setEditingAlbum(null);
    }

    saveMedia(finalPhotos, finalAlbums, localMasterAlbum);
    showNotification('✓ All team changes saved successfully!');`
);

fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
