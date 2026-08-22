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
    const players = docSnap.data().players;
    
    let defaultData = fs.readFileSync('src/data/defaultData.ts', 'utf8');
    
    // Replace INITIAL_PLAYERS
    // It looks like `export const INITIAL_PLAYERS: Player[] = [ ... ];`
    
    const startIdx = defaultData.indexOf('export const INITIAL_PLAYERS: Player[] = [');
    if (startIdx === -1) {
        console.error("Could not find INITIAL_PLAYERS");
        process.exit(1);
    }
    
    const endIdx = defaultData.indexOf('export const INITIAL_MATCHES', startIdx);
    if (endIdx === -1) {
        console.error("Could not find end of INITIAL_PLAYERS");
        process.exit(1);
    }
    
    const newStr = 'export const INITIAL_PLAYERS: Player[] = ' + JSON.stringify(players, null, 2) + ';\n\n';
    const updated = defaultData.slice(0, startIdx) + newStr + defaultData.slice(endIdx);
    
    fs.writeFileSync('src/data/defaultData.ts', updated);
    console.log("Updated defaultData.ts");
    process.exit(0);
}

run();
