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
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    // 1. Process any pending redirect result FIRST, before subscribing to
    //    onAuthStateChanged. This ensures the user is fully signed in by the
    //    time the auth state listener fires on page load after a redirect.
    getRedirectResult(auth)
      .then((result) => {
        // result is null if there's no pending redirect — that's fine.
        // If result.user exists, onAuthStateChanged will also fire with the
        // same user, so no need to call setUser here.
        if (result?.user) {
          console.log("Redirect sign-in complete:", result.user.email);
        }
      })
      .catch((err) => {
        console.error("getRedirectResult error:", err.code, err.message);
      });

    // 2. Subscribe to auth state — this is the single source of truth for
    //    whether the user is logged in or not.
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

  // Triggers full-page redirect to Google — page navigates away immediately.
  // After Google auth, browser returns to this app and getRedirectResult above
  // processes the result, then onAuthStateChanged fires with the signed-in user.
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