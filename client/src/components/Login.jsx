import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Spinner = () => (
  <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

function Label({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", letterSpacing: "0.3px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Login() {
  const { signIn, signUp, signInWithGooglePopup, signInWithGoogleRedirect } = useAuth();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (!form.name.trim()) return setError("Display name is required.");
      if (form.password !== form.confirm) return setError("Passwords do not match.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(form.email, form.password, form.name.trim());
      } else {
        await signIn(form.email, form.password);
      }
    } catch (err) {
      const map = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/weak-password": "Password is too weak.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };
      setError(map[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    // 1. Start loading state
    setGoogleLoading(true);
    setError("");

    try {
      // 2. Try the fast popup method first
      await signInWithGooglePopup();
      // navigate('/dashboard'); // Redirect to your app on success!

    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        console.warn("Popup blocked. Falling back to redirect...");
        setError("Redirecting to Google...");
        await signInWithGoogleRedirect();
      } else if (err.code !== "auth/popup-closed-by-user") {
        // Handle other real errors (like network issues)
        setError(err.message);
        setGoogleLoading(false);
      } else {
        // User manually closed the popup
        setGoogleLoading(false);
      }
    }
  };
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      overflowY: "auto",
      background: `linear-gradient(rgba(7,7,14,0.88), rgba(7,7,14,0.88)),
        url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2070&q=80')
        center/cover no-repeat fixed`,
    }}>

      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.3,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Accent glow top */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "400px", pointerEvents: "none",
        background: "radial-gradient(ellipse at top, rgba(233,69,96,0.18) 0%, transparent 65%)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "460px",
        background: "linear-gradient(135deg, rgba(19,19,36,0.97), rgba(13,13,26,0.99))",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "24px",
        padding: "48px 44px 40px",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(233,69,96,0.07)",
        animation: "fadeUp 0.45s cubic-bezier(.22,1,.36,1)",
      }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, #e94560, #c73050)",
            boxShadow: "0 4px 16px rgba(233,69,96,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M12 36L24 12L36 36" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M16 28L32 28" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#f0f0ff", letterSpacing: "-0.4px", lineHeight: 1 }}>MileExp</div>
            <div style={{ fontSize: "11px", color: "#4a4a70", letterSpacing: "0.5px", marginTop: "3px" }}>Banking Analytics</div>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: "flex", background: "#131324",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px", padding: "4px", marginBottom: "24px", gap: "4px",
        }}>
          {[["signin", "Sign In"], ["signup", "Create Account"]].map(([val, lbl]) => (
            <button key={val} onClick={() => { setMode(val); setError(""); }} style={{
              flex: 1, padding: "10px 16px", borderRadius: "8px", border: "none",
              fontSize: "13.5px", fontWeight: mode === val ? 700 : 500,
              fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
              background: mode === val ? "#e94560" : "transparent",
              color: mode === val ? "#fff" : "#8b8bb0",
            }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f0f0ff", letterSpacing: "-0.6px", marginBottom: "8px", lineHeight: 1.2 }}>
          {mode === "signin" ? "Welcome back" : "Get started"}
        </h1>
        <p style={{ fontSize: "14px", color: "#8b8bb0", lineHeight: 1.6, marginBottom: "24px" }}>
          {mode === "signin" ? "Sign in to your banking analytics dashboard" : "Create your MileExp account to get started"}
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.30)",
            borderRadius: "8px", padding: "12px 16px",
            fontSize: "13.5px", color: "#f43f5e", marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          {mode === "signup" && (
            <Label label="Full Name">
              <input type="text" name="name" placeholder="Aaron Perez"
                value={form.name} onChange={handleChange} required autoComplete="name"
                className="themed-input" />
            </Label>
          )}
          <Label label="Email">
            <input type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required autoComplete="email"
              className="themed-input" />
          </Label>
          <Label label="Password">
            <input type="password" name="password"
              placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
              value={form.password} onChange={handleChange} required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="themed-input" />
          </Label>
          {mode === "signup" && (
            <Label label="Confirm Password">
              <input type="password" name="confirm" placeholder="Re-enter password"
                value={form.confirm} onChange={handleChange} required autoComplete="new-password"
                className="themed-input" />
            </Label>
          )}

          <button type="submit" disabled={loading} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            width: "100%", padding: "13px 20px", marginTop: "4px",
            background: "linear-gradient(135deg, #e94560, #c73050)",
            border: "none", borderRadius: "12px",
            color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            boxShadow: "0 4px 16px rgba(233,69,96,0.35)", transition: "all 0.2s",
          }}>
            {loading && <Spinner />}
            {loading ? (mode === "signup" ? "Creating account…" : "Signing in…") : (mode === "signup" ? "Create Account" : "Sign In")}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 16px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "12px", color: "#4a4a70" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoading} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          width: "100%", padding: "12px 20px", marginBottom: "20px",
          background: "#131324", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "12px",
          color: "#f0f0ff", fontSize: "14px", fontWeight: 600, fontFamily: "inherit",
          cursor: googleLoading ? "not-allowed" : "pointer", opacity: googleLoading ? 0.6 : 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)", transition: "all 0.2s",
        }}>
          {googleLoading ? <Spinner /> : (
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        <p style={{ fontSize: "12px", color: "#4a4a70", textAlign: "center", lineHeight: 1.6 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
