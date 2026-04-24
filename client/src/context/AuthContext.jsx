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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(undefined); // undefined = loading
  const [jwtToken, setJwtToken]   = useState(null);      // Firebase JWT
  const [backendToken, setBackendToken] = useState(     // Our custom backend JWT
    () => localStorage.getItem("mileexp_backend_token") || null
  );

  useEffect(() => {
    // Handle Google redirect result
    getRedirectResult(auth).catch(() => {});

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

  // ── Custom backend signup ──
  // Creates user in Firebase AND saves to our MongoDB via /api/auth/signup
  const signUp = async (email, password, displayName) => {
    // 1. Create in Firebase
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    // 2. Also register in our MongoDB backend
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, email, password }),
      });
      const data = await res.json();
      if (data.token) {
        setBackendToken(data.token);
        localStorage.setItem("mileexp_backend_token", data.token);
      }
    } catch (err) {
      console.warn("Backend signup failed (non-critical):", err.message);
    }

    return cred.user;
  };

  // ── Custom backend signin ──
  // Signs in via Firebase AND gets our custom JWT from backend
  const signIn = async (email, password) => {
    // 1. Sign in via Firebase
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // 2. Also get our custom backend JWT
    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        setBackendToken(data.token);
        localStorage.setItem("mileexp_backend_token", data.token);
      }
    } catch (err) {
      console.warn("Backend signin failed (non-critical):", err.message);
    }

    return cred.user;
  };

  // ── Google sign in ──
  const signInWithGoogle = () => {
    try {
      return signInWithPopup(auth, googleProvider);
    } catch {
      return signInWithRedirect(auth, googleProvider);
    }
  };

  // ── Sign out ──
  const signOut = async () => {
    await firebaseSignOut(auth);
    setJwtToken(null);
    setBackendToken(null);
    localStorage.removeItem("mileexp_token");
    localStorage.removeItem("mileexp_backend_token");
  };

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(false);
  };

  // Decode Firebase JWT payload (name, email, uid, provider, exp etc.)
  const tokenPayload = jwtToken
    ? (() => {
        try { return JSON.parse(atob(jwtToken.split(".")[1])); }
        catch { return null; }
      })()
    : null;

  // Decode our custom backend JWT payload
  const backendTokenPayload = backendToken
    ? (() => {
        try { return JSON.parse(atob(backendToken.split(".")[1])); }
        catch { return null; }
      })()
    : null;

  return (
    <AuthContext.Provider value={{
      user,
      jwtToken,          // Firebase JWT — used for API calls
      backendToken,      // Our custom backend JWT
      tokenPayload,      // Firebase JWT decoded
      backendTokenPayload, // Backend JWT decoded (uid, name, email)
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

export const useAuth = () => useContext(AuthContext);