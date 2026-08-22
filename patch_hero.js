import fs from 'fs';
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const target = `<ActionCarousel className="lg:h-full flex flex-col flex-1" 
                photos={actionPhotos}
                albums={googlePhotosAlbums}
                masterAlbumInfo={masterAlbumInfo}
                onOpenPhotoManager={onOpenPhotoManager}
              />`;

const replacement = `<ActionCarousel className="lg:h-full flex flex-col flex-1" isAdminMode={isAdminMode} />`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Hero.tsx', content);
