const fs = require('fs');
let code = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

const replacement = `
    if (onSaveAllData) {
      onSaveAllData({
        players: finalPlayers,
        matches: localMatches,
        standings: localStandings,
        coaches: finalCoaches,
        teamInfo: localTeamInfo,
        actionPhotos: finalPhotos,
        googlePhotosAlbums: finalAlbums,
        masterAlbumInfo: localMasterAlbum
      });
    } else {
      onSavePlayers(finalPlayers);
      onSaveMatches(localMatches);
      onSaveStandings(localStandings);
      onSaveCoaches(finalCoaches);
      onSaveTeamInfo(localTeamInfo);
      if (onSaveActionPhotos) onSaveActionPhotos(finalPhotos);
      if (onSaveGooglePhotosAlbums) onSaveGooglePhotosAlbums(finalAlbums);
      if (onSaveMasterAlbumInfo) onSaveMasterAlbumInfo(localMasterAlbum);
    }
`;

if (code.includes('onSavePlayers(finalPlayers);')) {
  code = code.replace(
    /onSavePlayers\(finalPlayers\);\s*onSaveMatches\(localMatches\);\s*onSaveStandings\(localStandings\);\s*onSaveCoaches\(finalCoaches\);\s*onSaveTeamInfo\(localTeamInfo\);/g,
    replacement
  );
  
  code = code.replace(/if \(onSaveActionPhotos\) onSaveActionPhotos\(finalPhotos\);\s*if \(onSaveGooglePhotosAlbums\) onSaveGooglePhotosAlbums\(finalAlbums\);\s*if \(onSaveMasterAlbumInfo\) onSaveMasterAlbumInfo\(localMasterAlbum\);/g, '');
}

fs.writeFileSync('src/components/TeamEditorModal.tsx', code);
