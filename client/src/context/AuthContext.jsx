/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
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

  // ✅ Popup only — called directly from button click, no await before it
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

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
    <AuthContext.Provider value={{ user, jwtToken, tokenPayload, getToken, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);