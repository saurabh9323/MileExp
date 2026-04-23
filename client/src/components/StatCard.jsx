/* ─── StatCard ───────────────────────────────────────────
   Shared stat tile used in Dashboard & Analytics views.
   Props: num, lbl, accent, trend, icon
─────────────────────────────────────────────────────── */
export default function StatCard({ num, lbl, accent, trend, icon }) {
  return (
    <div
      style={{
        background: accent
          ? "linear-gradient(135deg, rgba(233,69,96,0.12), rgba(199,48,80,0.08))"
          : "var(--bg2)",
        border: accent
          ? "1px solid rgba(233,69,96,0.25)"
          : "1px solid var(--border2)",
        borderRadius: "16px",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.8px", color: "var(--text3)",
        }}>
          {lbl}
        </span>
        {icon && (
          <span style={{ color: accent ? "var(--accent)" : "var(--text3)", opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>

      <div style={{
        fontSize: "32px", fontWeight: 800,
        color: accent ? "var(--accent)" : "var(--text)",
        letterSpacing: "-1px", lineHeight: 1,
      }}>
        {num?.toLocaleString() ?? "—"}
      </div>

      {trend !== undefined && (
        <div style={{
          fontSize: "12px",
          color: trend >= 0 ? "var(--green)" : "var(--red)",
          fontWeight: 600,
        }}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}
