/* ─── SettingsView ───────────────────────────────────────
   Application preferences panel.
   Props: theme, toggleTheme
─────────────────────────────────────────────────────── */
import { IconThemeDark, IconThemeLight } from "../icons/index";

export default function SettingsView({ theme, toggleTheme }) {
  return (
    <div style={{ padding: "28px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
        Settings
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "24px" }}>
        Application preferences
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>

        <SettingRow label="Theme" desc={`Currently: ${theme === "dark" ? "Dark" : "Light"} mode`}>
          <button
            onClick={toggleTheme}
            style={{
              padding: "8px 16px", borderRadius: "10px", border: "1px solid var(--border2)",
              background: "var(--bg3)", color: "var(--text)", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            {theme === "dark" ? <IconThemeDark /> : <IconThemeLight />}
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </SettingRow>

        <SettingRow label="API Endpoint" desc="Backend server URL">
          <code style={{
            fontSize: "12px", color: "var(--text3)",
            background: "var(--bg3)", padding: "6px 12px",
            borderRadius: "8px", border: "1px solid var(--border)",
          }}>
            {import.meta.env?.VITE_API_URL || "http://localhost:5000/api"}
          </code>
        </SettingRow>

        <SettingRow label="Page Limit" desc="Rows per page in customer table">
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)" }}>15</span>
        </SettingRow>

      </div>
    </div>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border2)",
      borderRadius: "14px", padding: "16px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}
