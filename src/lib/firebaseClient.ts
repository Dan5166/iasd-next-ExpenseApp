// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  type UserCredential,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

interface LoginProps {
  email: string;
  password: string;
}

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "admin" | "user" | "guest"; // podés ajustar los roles válidos
  image: string;
  createdAt: string; // ISO string (ej. "2025-10-30T00:00:00.000Z")
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
// Evitar inicialización múltiple
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

interface LoginProps {
  email: string;
  password: string;
}

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: "admin" | "user" | "guest";
  image: string;
  createdAt: string; // ISO string
}

export const loginEmailPassFirebase = async ({
  email,
  password,
}: LoginProps): Promise<FirestoreUser> => {
  const firebaseRes = await signInWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, "users", firebaseRes.user.uid);
  const userSnap = await getDoc(userRef);

  let userData: FirestoreUser;

  if (!userSnap.exists()) {
    // 🔹 Crear nuevo usuario en Firestore
    userData = {
      id: firebaseRes.user.uid,
      name: firebaseRes.user.displayName ?? "",
      email: firebaseRes.user.email ?? "",
      emailVerified: firebaseRes.user.emailVerified,
      role: "admin", // puedes cambiarlo si quieres asignar según dominio, etc.
      image: firebaseRes.user.photoURL ?? "",
      createdAt: new Date().toISOString(),
    };

    await setDoc(userRef, userData);
    console.log("✅ Usuario creado en Firestore:", userData);
  } else {
    // 🔹 Usuario existente → leemos los datos guardados
    const data = userSnap.data() as FirestoreUser;

    userData = {
      id: data.id ?? firebaseRes.user.uid,
      name: data.name ?? firebaseRes.user.displayName ?? "",
      email: data.email ?? firebaseRes.user.email ?? "",
      emailVerified:
        data.emailVerified ?? firebaseRes.user.emailVerified ?? false,
      role: data.role ?? "user",
      image: data.image ?? firebaseRes.user.photoURL ?? "",
      createdAt: data.createdAt ?? new Date().toISOString(),
    };

    console.log("ℹ️ Usuario existente en Firestore:", userData);
  }

  return userData;
};
