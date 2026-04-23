/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still loading, null = logged out, object = logged in
  const [user, setUser] = useState(undefined);
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      // ✅ CRITICAL: Wait for redirect result BEFORE subscribing to auth state
      // This prevents the flicker where Firebase briefly sees no user
      // and redirects back to login page
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user) {
          console.log("✅ Google redirect login:", redirectResult.user.email);
        }
      } catch (err) {
        console.error("Redirect result error:", err.code);
      }

      // Now subscribe to auth state — redirect result is already processed
      unsubscribe = onAuthStateChanged(auth, async (u) => {
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
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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

  const signInWithGoogle = async () => {
    try {
      // Try popup first (works on localhost and most browsers)
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        // Browser blocked popup — use redirect instead
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
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