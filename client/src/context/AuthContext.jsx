import { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
  getIdToken,
  getRedirectResult
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [jwtToken, setJwtToken] = useState(null);
useEffect(() => {
  let isMounted = true;

  const initAuth = async () => {
    try {
      // 🔥 Capture redirect result FIRST
      const result = await getRedirectResult(auth);

      if (result?.user) {
        console.log("Redirect login success:", result.user);
      }
    } catch (err) {
      console.error("Redirect error:", err);
    }

    // 🔥 THEN listen to auth state
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return;

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
  };

  const unsubscribePromise = initAuth();

  return () => {
    isMounted = false;
    unsubscribePromise.then((unsub) => unsub && unsub());
  };
}, []);



  const getToken = async (forceRefresh = false) => {
    if (!auth.currentUser) return null;
    const token = await getIdToken(auth.currentUser, forceRefresh);
    setJwtToken(token);
    return token;
  };

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    setUser({ ...cred.user, displayName }); // Force immediate state update
    return cred.user;
  };

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // Expose BOTH Google methods
  const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
  const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setJwtToken(null);
    localStorage.removeItem("mileexp_token");
  };

  // Safe decoding
  const tokenPayload = useMemo(() => {
    if (!jwtToken) return null;
    try {
      const base64Url = jwtToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (err) {
      console.error("Failed to decode token", err);
      return null;
    }
  }, [jwtToken]);

  const value = {
    user,
    jwtToken,
    tokenPayload,
    loading: user === undefined,
    getToken,
    signUp,
    signIn,
    signInWithGooglePopup,
    signInWithGoogleRedirect,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};