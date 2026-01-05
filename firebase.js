import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCD8IHe8xZhakt1RN1HDD5cqplnSVpsZx0",
  authDomain: "fraudshield-ai-9063a.firebaseapp.com",
  projectId: "fraudshield-ai-9063a",
  storageBucket: "fraudshield-ai-9063a.firebasestorage.app",
  messagingSenderId: "346283029044",
  appId: "1:346283029044:web:d8ab8c415cdaead4a71061",
  measurementId: "G-3LFGNFY4X2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveToFirebase(txData) {
  await addDoc(collection(db, "transactions"), txData);
}

export {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
};

window.db = db;
window.addDoc = addDoc;
window.collection = collection;
window.onSnapshot = onSnapshot;
window.query = query;
window.orderBy = orderBy;
window.where = where;   // ✅ YE LINE ADD KARO

