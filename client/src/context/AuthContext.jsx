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
  const [user, setUser] = useState(undefined); // undefined = loading
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Get Firebase ID token (this IS our JWT — signed by Firebase)
        const token = await u.getIdToken();
        setJwtToken(token);
        // Store token with user info payload for use throughout app
        localStorage.setItem("mileexp_token", token);
      } else {
        setJwtToken(null);
        localStorage.removeItem("mileexp_token");
      }
      setUser(u || null);
    });
    return unsub;
  }, []);

  // Refresh token helper (Firebase tokens expire after 1h)
  const getToken = async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(false); // false = use cached if valid
    setJwtToken(token);
    return token;
  };

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name on the Firebase user profile
    await updateProfile(cred.user, { displayName });
    return cred.user;
  };

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setJwtToken(null);
    localStorage.removeItem("mileexp_token");
  };

  // Decoded token payload (name, email, uid etc.) — Firebase tokens are JWTs
  const tokenPayload = jwtToken
    ? (() => {
        try {
          return JSON.parse(atob(jwtToken.split(".")[1]));
        } catch {
          return null;
        }
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
