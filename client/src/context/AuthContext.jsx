/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  getIdToken,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await getIdToken(u);
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

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // signInWithPopup MUST be called synchronously from a click handler.
  // No await, no setState, no anything before this in the call chain.
  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setJwtToken(null);
    localStorage.removeItem("mileexp_token");
  };

  const getToken = async (forceRefresh = false) => {
    if (!auth.currentUser) return null;
    const token = await getIdToken(auth.currentUser, forceRefresh);
    setJwtToken(token);
    return token;
  };

  const tokenPayload = useMemo(() => {
    if (!jwtToken) return null;
    try {
      const base64 = jwtToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch { return null; }
  }, [jwtToken]);

  return (
    <AuthContext.Provider value={{
      user,
      jwtToken,
      tokenPayload,
      loading: user === undefined,
      getToken,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};