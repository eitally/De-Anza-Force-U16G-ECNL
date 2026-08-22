import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0890913570",
  appId: "1:660142708319:web:694e3cc25441c75f0e6dea",
  apiKey: "AIzaSyD0LwSHx0AHcdBEg0XC7rf9U2XnIU3T1Fo",
  authDomain: "gen-lang-client-0890913570.firebaseapp.com"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-deanzaforcesocce-67829d24-5955-4daa-965e-bbfccc815d47");
const TEAM_DATA_DOC = doc(db, 'deanza_force_data', 'global_team_data');

async function test() {
  const docSnap = await getDoc(TEAM_DATA_DOC);
  const data = docSnap.data();
  const player = data.players[0];
  console.log("Before:", player.name, player.photoUrl);
  
  // modify it
  player.photoUrl = "https://example.com/test.jpg";
  await setDoc(TEAM_DATA_DOC, data, { merge: true });
  
  const docSnap2 = await getDoc(TEAM_DATA_DOC);
  const player2 = docSnap2.data().players[0];
  console.log("After:", player2.name, player2.photoUrl);
  process.exit(0);
}
test();
