import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

const targetStr = `  // Save all changes
  const handleSaveAll = () => {
    onSavePlayers(localPlayers);
    onSaveMatches(localMatches);
    onSaveStandings(localStandings);
    onSaveCoaches(localCoaches);
    onSaveTeamInfo(localTeamInfo);`;

const replaceStr = `  // Save all changes
  const handleSaveAll = () => {
    // Auto-save any in-progress player edits
    let finalPlayers = [...localPlayers];
    if (editingPlayer) {
      if (isCreatingPlayer) {
        finalPlayers = [...finalPlayers, { ...editingPlayer, id: \`p_\${Date.now()}\` }];
      } else {
        finalPlayers = finalPlayers.map(p => p.id === editingPlayer.id ? editingPlayer : p);
      }
      setEditingPlayer(null);
      setIsCreatingPlayer(false);
    }

    // Auto-save any in-progress coach edits
    let finalCoaches = [...localCoaches];
    if (editingCoach) {
      if (isCreatingCoach) {
        finalCoaches = [...finalCoaches, { ...editingCoach, id: \`c_\${Date.now()}\` }];
      } else {
        finalCoaches = finalCoaches.map(c => c.id === editingCoach.id ? editingCoach : c);
      }
      setEditingCoach(null);
      setIsCreatingCoach(false);
    }

    onSavePlayers(finalPlayers);
    onSaveMatches(localMatches);
    onSaveStandings(localStandings);
    onSaveCoaches(finalCoaches);
    onSaveTeamInfo(localTeamInfo);`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
  console.log("Success");
} else {
  console.log("Failed to find target");
}
