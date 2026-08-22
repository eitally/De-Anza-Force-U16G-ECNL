import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  projectId: "gen-lang-client-0890913570",
  appId: "1:660142708319:web:694e3cc25441c75f0e6dea",
  apiKey: "AIzaSyD0LwSHx0AHcdBEg0XC7rf9U2XnIU3T1Fo",
  authDomain: "gen-lang-client-0890913570.firebaseapp.com"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-deanzaforcesocce-67829d24-5955-4daa-965e-bbfccc815d47");
const TEAM_DATA_DOC = doc(db, 'deanza_force_data', 'global_team_data');

async function run() {
    const docSnap = await getDoc(TEAM_DATA_DOC);
    const data = docSnap.data();
    
    const fixedPlayers = data.players.map(p => {
        let np = { ...p };
        if (np.email !== undefined) {
            np.contactEmail = np.email;
            delete np.email;
        }
        if (np.imageUrl !== undefined) {
            if (!np.photoUrl || np.photoUrl.includes('wikimedia')) {
                np.photoUrl = np.imageUrl;
            }
            delete np.imageUrl;
        }
        
        np.secondaryPositions = np.secondaryPositions || [];
        np.dominantFoot = np.dominantFoot || 'Right';
        np.highSchool = np.highSchool || 'TBD';
        np.commitment = np.commitment || 'Uncommitted';
        np.stats = np.stats || { appearances: 0, goals: 0, assists: 0 };
        np.awards = np.awards || [];
        return np;
    });

    let code = `import { Player, Match, StandingTeam, Coach, TeamInfo, ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from '../types';

export const INITIAL_TEAM_INFO: TeamInfo = ${JSON.stringify(data.teamInfo, null, 2)};

export const INITIAL_PLAYERS: Player[] = ${JSON.stringify(fixedPlayers, null, 2)};

export const INITIAL_MATCHES: Match[] = ${JSON.stringify(data.matches, null, 2)};

export const INITIAL_STANDINGS: StandingTeam[] = ${JSON.stringify(data.standings, null, 2)};

export const INITIAL_COACHES: Coach[] = ${JSON.stringify(data.coaches, null, 2)};

export const INITIAL_TOURNAMENTS: any[] = [];

export const DEFAULT_ACTION_PHOTOS: ActionPhoto[] = ${JSON.stringify(data.actionPhotos, null, 2)};

export const DEFAULT_GOOGLE_PHOTOS_ALBUMS: GooglePhotosAlbum[] = ${JSON.stringify(data.googlePhotosAlbums, null, 2)};

export const DEFAULT_MASTER_ALBUM_INFO: MasterAlbumInfo = ${JSON.stringify(data.masterAlbumInfo, null, 2)};
`;

    fs.writeFileSync('src/data/defaultData.ts', code);
    console.log("Done");
    process.exit(0);
}
run();
