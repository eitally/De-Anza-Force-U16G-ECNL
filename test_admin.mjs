import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  projectId: "gen-lang-client-0890913570"
});

// Use the specific database
const db = getFirestore("ai-studio-deanzaforcesocce-67829d24-5955-4daa-965e-bbfccc815d47");
const docRef = db.collection('deanza_force_data').doc('global_team_data');

async function run() {
  try {
    console.log("Reading...");
    const d = await docRef.get();
    if(d.exists) {
      const players = d.data().players;
      const sasha = players.find(p => p.name.includes("Sasha"));
      console.log("Sasha exists?", !!sasha);
      if(sasha) {
        const filtered = players.filter(p => p.id !== sasha.id);
        await docRef.update({ players: filtered });
        console.log("Deleted Sasha from DB using admin!");
      }
    }
  } catch (e) {
    console.error("ERROR", e);
  }
  process.exit(0);
}
run();
