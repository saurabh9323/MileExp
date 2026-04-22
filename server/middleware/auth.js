import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  // Option A: Use service account JSON file (recommended for production)
  // Place your serviceAccountKey.json in the server root and set:
  // GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
  //
  // Option B: Use env vars (for Render / Railway / Vercel)
  // Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env

  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in the private key from env
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    // Fallback: application default credentials (works if GOOGLE_APPLICATION_CREDENTIALS is set)
    admin.initializeApp();
  }
}

/**
 * Express middleware: verifies Firebase ID token in Authorization header.
 * Attaches decoded token to req.user on success.
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: missing token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: invalid token", detail: err.message });
  }
};
