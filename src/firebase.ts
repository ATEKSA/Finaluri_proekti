import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Reads Firebase configuration from Vite environment variables (.env file)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if all essential Firebase configuration variables are provided
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId && 
  firebaseConfig.appId;

export let db: any = null;
export let auth: any = null;
export let isFirebaseEnabled = false;

if (isConfigValid) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log('⚡ Firebase initialized successfully!');
  } catch (error) {
    console.error('❌ Firebase initialization failed. Falling back to local storage mode:', error);
  }
} else {
  console.warn(
    '⚠️ Firebase configuration is missing or incomplete in environment variables.\n' +
    'The app will run in "Local Mode" using localStorage to mock authentication and database sync.\n' +
    'To connect to your Firebase project, create a ".env" file in the project root with your credentials.'
  );
}
