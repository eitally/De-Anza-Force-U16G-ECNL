import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

content = content.replace(
  /let finalPhotos = \[\.\.\.localPhotos\];\n\s*if \(editingPhoto\) \{/,
  `if (editingPhoto) {`
);

fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
