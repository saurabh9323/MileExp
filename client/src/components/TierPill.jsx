/* ─── TierPill ── shared badge used across views ── */
const TIER_COLORS = {
  Gold:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.30)"  },
  Silver:   { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.30)" },
  Bronze:   { color: "#b45309", bg: "rgba(180,83,9,0.12)",    border: "rgba(180,83,9,0.30)"    },
  Platinum: { color: "#818cf8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.30)"  },
};

export default function TierPill({ tier }) {
  const c = TIER_COLORS[tier] || { color: "#8b8bb0", bg: "rgba(139,139,176,0.12)", border: "rgba(139,139,176,0.3)" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "99px",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px",
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
    }}>
      {tier}
    </span>
  );
}
