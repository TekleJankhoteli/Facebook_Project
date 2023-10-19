import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.2.0/firebase-firestore.js';

const yourFirebaseConfig = {
  apiKey: "AIzaSyCa4dm2nrwHoEgpwRHlxLTRNUNxezjuVBc",
  authDomain: "fbauthandlogin.firebaseapp.com",
  projectId: "fbauthandlogin",
  storageBucket: "fbauthandlogin.appspot.com",
  messagingSenderId: "127857376542",
  appId: "1:127857376542:web:1b8be58a118583fb69dd0f",
  measurementId: "G-2QN6ZBDL2Y"
};

const app = initializeApp(yourFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db, app};