import fs from 'fs';
let content = fs.readFileSync('src/components/RosterSection.tsx', 'utf8');

const targetStr = `      if (commitmentFilter === 'Uncommitted' && player.commitment !== 'Uncommitted') {
        return false;
      }

      return true;
    });
  }, [players, selectedPosition, commitmentFilter]);`;

const replaceStr = `      if (commitmentFilter === 'Uncommitted' && player.commitment !== 'Uncommitted') {
        return false;
      }

      return true;
    }).sort((a, b) => (a.jerseyNumber || 999) - (b.jerseyNumber || 999));
  }, [players, selectedPosition, commitmentFilter]);`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/RosterSection.tsx', content);
  console.log("Success");
} else {
  console.log("Failed to find target");
}
