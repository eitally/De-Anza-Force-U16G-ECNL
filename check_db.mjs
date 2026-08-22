import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0890913570",
  appId: "1:660142708319:web:694e3cc25441c75f0e6dea",
  apiKey: "AIzaSyD0LwSHx0AHcdBEg0XC7rf9U2XnIU3T1Fo",
  authDomain: "gen-lang-client-0890913570.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-deanzaforcesocce-67829d24-5955-4daa-965e-bbfccc815d47");
const docRef = doc(db, 'deanza_force_data', 'global_team_data');

async function run() {
  try {
    const d = await getDoc(docRef);
    if(d.exists()){
      const players = d.data().players;
      const sasha = players.find(p => p.name.includes("Sasha"));
      console.log("Sasha exists?", !!sasha);
      console.log("Total players:", players.length);
    } else {
      console.log("Doc does not exist!");
    }
  } catch (e) {
    console.error("ERROR", e);
  }
  process.exit(0);
}
run();
