import fs from 'fs';
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const target1 = `  actionPhotos?: ActionPhoto[];
  googlePhotosAlbums?: GooglePhotosAlbum[];
  masterAlbumInfo?: MasterAlbumInfo;
  onOpenPhotoManager?: () => void;`;

const target2 = `  actionPhotos,
  googlePhotosAlbums,
  masterAlbumInfo,
  onOpenPhotoManager,`;

content = content.replace(target1, "");
content = content.replace(target2, "");
fs.writeFileSync('src/components/Hero.tsx', content);
