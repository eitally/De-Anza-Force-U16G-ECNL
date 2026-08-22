const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const saveAllFunc = `
  const handleSaveAllData = (data: {
    players: Player[];
    matches: Match[];
    standings: StandingTeam[];
    coaches: Coach[];
    teamInfo: TeamInfo;
    actionPhotos: ActionPhoto[];
    googlePhotosAlbums: GooglePhotosAlbum[];
    masterAlbumInfo: MasterAlbumInfo;
  }) => {
    // Automatically recalculate and sync De Anza Force standings and team season record from match schedule
    const synced = syncStandingsAndTeamInfoWithMatches(data.matches, data.standings, data.teamInfo);
    data.standings = synced.updatedStandings;
    data.teamInfo = synced.updatedTeamInfo;

    setPlayers(data.players);
    setMatches(data.matches);
    setStandings(data.standings);
    setCoaches(data.coaches);
    setTeamInfo(data.teamInfo);
    setActionPhotos(data.actionPhotos);
    setGooglePhotosAlbums(data.googlePhotosAlbums);
    setMasterAlbumInfo(data.masterAlbumInfo);

    setDoc(TEAM_DATA_DOC, data, { merge: true }).catch(console.error);
  };
`;

code = code.replace(
  `  const handleResetToDefaults = () => {`,
  `${saveAllFunc}\n  const handleResetToDefaults = () => {`
);

code = code.replace(
  `        onSaveMasterAlbumInfo={handleSaveMasterAlbumInfo}`,
  `        onSaveMasterAlbumInfo={handleSaveMasterAlbumInfo}\n        onSaveAllData={handleSaveAllData}`
);

fs.writeFileSync('src/App.tsx', code);
