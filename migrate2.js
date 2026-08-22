import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import Papa from 'papaparse';
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

async function migrate() {
  try {
    const docSnap = await getDoc(TEAM_DATA_DOC);
    const data = docSnap.data();
    const existingPlayers = data.players || [];
    
    // Parse CSV
    const csvFile = fs.readFileSync('roster.csv', 'utf8');
    const parsed = Papa.parse(csvFile, { header: false });
    // First, find the header row by looking for 'Jersey' and 'Name'
    let headerRowIndex = -1;
    for (let i = 0; i < parsed.data.length; i++) {
        if (parsed.data[i].includes('Jersey') && parsed.data[i].includes('Name')) {
            headerRowIndex = i;
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        throw new Error("Could not find header row in CSV");
    }
    
    const headers = parsed.data[headerRowIndex];
    const playerRows = parsed.data.slice(headerRowIndex + 1).filter(r => r[headers.indexOf('Jersey')] && r[headers.indexOf('Name')]);
    
    // Process new players
    const newPlayers = playerRows.map((row, i) => {
        const jersey = parseInt(row[headers.indexOf('Jersey')], 10);
        const name = row[headers.indexOf('Name')];
        const position = row[headers.indexOf('Position')];
        
        const gradYear = parseInt(row[headers.indexOf('Grad Year')] || '2029', 10);
        const email = row[headers.indexOf('Contact Info for the Flyer')];
        
        let height = row[headers.indexOf('height')] || row[headers.indexOf('Height')];
        let weight = row[headers.indexOf('weight')] || row[headers.indexOf('Weight')];
        let gpa = row[headers.indexOf('GPA')] || row[headers.indexOf('GPA1')];
        
        let existingPlayer = existingPlayers.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
        
        // Use placeholder if no image
        let photo = 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/De_Anza_Force_logo.svg/1200px-De_Anza_Force_logo.svg.png';
        if (existingPlayer && existingPlayer.photoUrl && !existingPlayer.photoUrl.includes('placeholder') && !existingPlayer.photoUrl.includes('wikimedia') && !existingPlayer.photoUrl.includes('daf-crest')) {
            photo = existingPlayer.photoUrl;
        }
        
        let primaryPos = 'Midfielder';
        let specificPos = 'Midfielder';
        if (position && typeof position === 'string') {
            const p = position.toLowerCase();
            if (p.includes('goal')) { primaryPos = 'Goalkeeper'; specificPos = 'Goalkeeper (#1)'; }
            else if (p.includes('defend') || p.includes('back')) { primaryPos = 'Defender'; specificPos = 'Center Back (#4)'; }
            else if (p.includes('wing') || p.includes('forward')) { primaryPos = 'Forward'; specificPos = 'Winger (#7/#11)'; }
        }

        return {
            ...(existingPlayer || {
                secondaryPositions: [],
                dominantFoot: 'Right',
                highSchool: 'TBD',
                commitment: 'Uncommitted',
                stats: { appearances: 0, goals: 0, assists: 0 }
            }), // keep any other stats/data
            id: existingPlayer ? existingPlayer.id : 'p_' + Date.now() + '_' + i,
            name: name,
            jerseyNumber: isNaN(jersey) ? 99 : jersey,
            primaryPosition: primaryPos,
            specificPosition: existingPlayer ? existingPlayer.specificPosition : specificPos,
            gradYear: isNaN(gradYear) ? 2029 : gradYear,
            height: height || existingPlayer?.height || "5'6\"",
            weight: weight || existingPlayer?.weight || "",
            gpa: gpa || existingPlayer?.gpa || "",
            email: email || existingPlayer?.email || existingPlayer?.contactEmail || "", // keep contact
            photoUrl: photo
        };
    });
    
    await setDoc(TEAM_DATA_DOC, { players: newPlayers }, { merge: true });
    console.log("Successfully migrated " + newPlayers.length + " players with correct photoUrl.");
    process.exit(0);
  } catch(e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

migrate();
