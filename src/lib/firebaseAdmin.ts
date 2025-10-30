// lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    // Asegúrate de que este valor esté definido en tu .env
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

// ✅ Exporta instancias reutilizables
export const adminDB = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage(); // 🔥 accede directamente al bucket

export default admin;
