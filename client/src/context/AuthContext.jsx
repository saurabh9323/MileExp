/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    // ✅ Handle redirect result FIRST before setting up auth state listener
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // User came back from Google redirect — onAuthStateChanged will fire
          console.log("Redirect result user:", result.user.email);
        }
      })
      .catch((err) => {
        console.error("Redirect error:", err.code);
      });

    // Auth state listener — fires on login, logout, and after redirect
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const token = await u.getIdToken();
        setJwtToken(token);
        localStorage.setItem("mileexp_token", token);
      } else {
        setJwtToken(null);
        localStorage.removeItem("mileexp_token");
      }
      setUser(u || null);
    });

    return unsub;
  }, []);

  const getToken = async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(false);
    setJwtToken(token);
    return token;
  };

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    return cred.user;
  };

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  // Try popup first, fall back to redirect if blocked
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        // Fall back to redirect
        return signInWithRedirect(auth, googleProvider);
      }
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setJwtToken(null);
    localStorage.removeItem("mileexp_token");
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