const fs = require('fs');
let code = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

const oldRegex = /\s*\/\/ Save all changes[\s\S]*?setTimeout\(\(\) => onClose\(\), 800\);\n  };/g;

const newCode = `  // Save all changes
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

    // Auto-save any in-progress photo addition
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
    
    // Auto-save any in-progress album addition
    let finalAlbums = [...localAlbums];
    if (editingAlbum) {
      finalAlbums = finalAlbums.map(a => a.id === editingAlbum.id ? editingAlbum : a);
      setEditingAlbum(null);
    }

    saveMedia(finalPhotos, finalAlbums, localMasterAlbum);

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

    showNotification('✓ All team changes saved successfully!');
    setTimeout(() => onClose(), 800);
  };`;

code = code.replace(oldRegex, "\n" + newCode);
fs.writeFileSync('src/components/TeamEditorModal.tsx', code);
