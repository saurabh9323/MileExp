/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    // Handle the redirect result when the user lands back on the app.
    // getRedirectResult resolves to null if there's no pending redirect —
    // so this is safe to call on every mount.
    getRedirectResult(auth).catch((err) => {
      // Swallow "popup closed" or "cancelled" errors that can surface here;
      // real errors (e.g. account-exists-with-different-credential) should be
      // surfaced to the user — re-throw or handle as needed.
      console.error("Redirect result error:", err);
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        setJwtToken(token);
        localStorage.setItem("mileexp_token", token);
        setUser(u);
      } else {
        setJwtToken(null);
        localStorage.removeItem("mileexp_token");
        setUser(null);
      }
    });

    return unsub;
  }, []);

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    return cred.user;
  };

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  // Triggers a full-page redirect to Google's OAuth screen.
  // Must be called synchronously inside a user-gesture handler (onClick).
  // The app will remount after the redirect; onAuthStateChanged picks up the
  // signed-in user automatically — no extra handling needed in Login.jsx.
  const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setJwtToken(null);
    localStorage.removeItem("mileexp_token");
  };

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(false);
  };

  const tokenPayload = jwtToken
    ? (() => {
        try { return JSON.parse(atob(jwtToken.split(".")[1])); }
        catch { return null; }
      })()
    : null;

  return (
    <AuthContext.Provider
      value={{ user, jwtToken, tokenPayload, getToken, signUp, signIn, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);