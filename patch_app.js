import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeroProps = `        <Hero 
          teamInfo={teamInfo}
          nextMatch={nextMatch}
          onOpenScoutPack={() => setIsScoutPackOpen(true)}
          playerCount={players.length}
          actionPhotos={actionPhotos}
          googlePhotosAlbums={googlePhotosAlbums}
          masterAlbumInfo={masterAlbumInfo}
          onOpenPhotoManager={isAdminMode ? () => handleOpenTeamEditor('media') : undefined}
        />`;

const replacementHeroProps = `        <Hero 
          teamInfo={teamInfo}
          nextMatch={nextMatch}
          onOpenScoutPack={() => setIsScoutPackOpen(true)}
          playerCount={players.length}
          isAdminMode={isAdminMode}
        />`;

content = content.replace(targetHeroProps, replacementHeroProps);
fs.writeFileSync('src/App.tsx', content);
