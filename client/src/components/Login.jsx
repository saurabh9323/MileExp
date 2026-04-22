import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Spinner = () => (
  <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
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
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2070&q=80')",
        }}
      />

      {/* ── Dark overlay ── */}
      <div className="absolute inset-0" style={{ background: "rgba(7,7,14,0.82)" }} />

      {/* ── Grid pattern overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `linear-gradient(var(--border2) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border2) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Radial glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: "700px", height: "400px",
          background: "radial-gradient(ellipse, rgba(233,69,96,0.18) 0%, transparent 70%)",
          animation: "pulse-glow 4s ease-in-out infinite",
        }}
      />

      {/* ── Bottom left decorative blobs ── */}
      <div
        className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Card ── */}
      <div
        className="relative z-10 w-full max-w-[460px] rounded-3xl border"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border2)",
          boxShadow: "0 0 0 1px var(--border), var(--shadow2), 0 0 80px rgba(233,69,96,0.08)",
          animation: "fadeUp 0.5s cubic-bezier(.22,1,.36,1)",
          padding: "52px 48px 44px",
        }}
      >

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #e94560, #c73050)",
              boxShadow: "0 4px 16px rgba(233,69,96,0.4)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M12 36L24 12L36 36" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M16 28L32 28" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-t1 font-extrabold text-xl tracking-tight leading-none mb-0.5">MileExp</div>
            <div className="text-t3 text-xs tracking-wide">Banking Analytics</div>
          </div>
        </div>

        {/* Mode tabs */}
        <div
          className="flex p-1 mb-6 rounded-r"
          style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}
        >
          {[["signin", "Sign In"], ["signup", "Create Account"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => { setMode(val); setError(""); }}
              className="flex-1 py-2.5 px-4 rounded text-sm font-semibold transition-all duration-150"
              style={
                mode === val
                  ? { background: "var(--accent)", color: "#fff" }
                  : { color: "var(--text2)" }
              }
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Heading */}
        <h1 className="text-t1 font-bold tracking-tight mb-2" style={{ fontSize: "28px", letterSpacing: "-0.6px" }}>
          {mode === "signin" ? "Welcome back" : "Get started"}
        </h1>
        <p className="text-t2 text-sm leading-relaxed mb-6">
          {mode === "signin"
            ? "Sign in to your banking analytics dashboard"
            : "Create your MileExp account to get started"}
        </p>

        {/* Error */}
        {error && (
          <div
            className="text-clr-red text-sm rounded-r px-4 py-3 mb-4"
            style={{ background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.30)" }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-5">

          {mode === "signup" && (
            <Label label="Full Name">
              <input
                type="text" name="name" placeholder="Aaron Perez"
                value={form.name} onChange={handleChange}
                required autoComplete="name"
                className="themed-input"
              />
            </Label>
          )}

          <Label label="Email">
            <input
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              required autoComplete="email"
              className="themed-input"
            />
          </Label>

          <Label label="Password">
            <input
              type="password" name="password"
              placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
              value={form.password} onChange={handleChange}
              required autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="themed-input"
            />
          </Label>

          {mode === "signup" && (
            <Label label="Confirm Password">
              <input
                type="password" name="confirm" placeholder="Re-enter password"
                value={form.confirm} onChange={handleChange}
                required autoComplete="new-password"
                className="themed-input"
              />
            </Label>
          )}

          <button
            type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 mt-1 text-white text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            style={{
              borderRadius: "var(--r2)",
              background: "linear-gradient(135deg, #e94560, #c73050)",
              boxShadow: "0 4px 16px rgba(233,69,96,0.35)",
              border: "none",
            }}
          >
            {loading && <Spinner />}
            {loading
              ? (mode === "signup" ? "Creating account…" : "Signing in…")
              : (mode === "signup" ? "Create Account" : "Sign In")}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: "var(--border2)" }} />
          <span className="text-t3 text-xs">or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border2)" }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle} disabled={googleLoading}
          className="flex items-center justify-center gap-2.5 w-full py-3 mt-4 mb-5 text-t1 text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:-translate-y-px"
          style={{
            background: "var(--bg3)",
            border: "1px solid var(--border2)",
            borderRadius: "var(--r2)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {googleLoading ? (
            <Spinner />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        <p className="text-t3 text-xs text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function Label({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-t2 tracking-wide">{label}</label>
      {children}
    </div>
  );
}
