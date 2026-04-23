export function Card({ title, children }) {
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border2)",
      borderRadius: "16px", padding: "20px 24px",
    }}>
      <div style={{
        fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.9px", color: "var(--text3)", marginBottom: "16px",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ── Spark line SVG ── */
export function SparkLine({ data, color = "var(--accent)", height = 48 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 200;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = height - ((v - min) / range) * (height - 6);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width: "100%", height: `${height}px`, overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(" ").at(-1).split(",")[0]} cy={pts.split(" ").at(-1).split(",")[1]} r="4" fill={color} />
    </svg>
  );
}

/* ── Horizontal bar ── */
export function HBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "11px", color: "var(--text3)", minWidth: "52px", textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: "8px", borderRadius: "99px", background: "var(--bg3)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px", transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text2)", minWidth: "28px" }}>{value}</span>
    </div>
  );
}