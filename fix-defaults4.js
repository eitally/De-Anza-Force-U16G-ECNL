import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
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
    const players = docSnap.data().players;
    
    // Now fix players to have the required fields
    const fixedPlayers = players.map(p => {
        let np = { ...p };
        if (np.email) {
            np.contactEmail = np.email;
            delete np.email;
        }
        if (np.imageUrl) {
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

    let defaultData = fs.readFileSync('src/data/defaultData.ts', 'utf8');
    
    const startIdx = defaultData.indexOf('export const INITIAL_PLAYERS: Player[] = [');
    const endIdx = defaultData.indexOf('export const INITIAL_MATCHES', startIdx);
    
    const newStr = 'export const INITIAL_PLAYERS: Player[] = ' + JSON.stringify(fixedPlayers, null, 2) + ';\n\n';
    let updated = defaultData.slice(0, startIdx) + newStr + defaultData.slice(endIdx);
    
    // Fix coaches: Replace "contactEmail" ONLY inside the INITIAL_COACHES block
    const coachStart = updated.indexOf('export const INITIAL_COACHES: Coach[] = [');
    const coachEnd = updated.indexOf('export const INITIAL_TEAM_INFO', coachStart);
    
    let coachBlock = updated.substring(coachStart, coachEnd);
    coachBlock = coachBlock.replace(/"contactEmail":/g, '"email":');
    
    updated = updated.slice(0, coachStart) + coachBlock + updated.slice(coachEnd);

    fs.writeFileSync('src/data/defaultData.ts', updated);
    
    // Also save fixedPlayers back to firebase to ensure DB is clean
    await setDoc(TEAM_DATA_DOC, { players: fixedPlayers }, { merge: true });
    
    console.log("Updated defaultData.ts and Firebase");
    process.exit(0);
}
run();
