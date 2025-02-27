import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAbemfST5ZTNaFx3vElxsSaRKbfU_y_96g",
    authDomain: "relics-5669d.firebaseapp.com",
    projectId: "relics-5669d",
    storageBucket: "relics-5669d.firebasestorage.app",
    messagingSenderId: "748903450258",
    appId: "1:748903450258:web:1c8a741a6118ba81fe884b",
    measurementId: "G-RPQPG8Z1X7"
};

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, db, storage };