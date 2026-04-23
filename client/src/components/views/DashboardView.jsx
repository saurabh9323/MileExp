/* ─── DashboardView ──────────────────────────────────────
   HIGH-LEVEL OVERVIEW — not a chart dump.
   Shows: KPI tiles, active ratio, tier donut + legend,
          top accounts summary, recent activity feed.
   Nothing here appears in AnalyticsView.
─────────────────────────────────────────────────────── */
import { StatCard, DonutChart } from "../charts/index.js";

const TIER_COLORS = {
  Gold:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.30)"  },
  Silver:   { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.30)" },
  Bronze:   { color: "#b45309", bg: "rgba(180,83,9,0.12)",    border: "rgba(180,83,9,0.30)"    },
  Platinum: { color: "#818cf8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.30)"  },
};

/* Fake recent activity derived from customers list */
function buildActivity(customers) {
  const actions = ["signed up", "upgraded tier", "opened account", "flagged alert", "updated profile"];
  return customers.slice(0, 7).map((c, i) => ({
    name: c.name || c.username || "Unknown",
    username: c.username,
    action: actions[i % actions.length],
    when: `${i + 1}h ago`,
    active: c.active,
  }));
}

export default function DashboardView({ user, stats, products, customers, pagination }) {
  const active      = stats.active ?? 0;
  const inactive    = (stats.total ?? 0) - active;
  const activeRatio = stats.total > 0 ? Math.round((active / stats.total) * 100) : 0;

  /* Tier donut */
  const tierCount = {};
  customers.forEach((c) =>
    Object.values(c.tier_and_details || {}).forEach((t) => {
      tierCount[t.tier] = (tierCount[t.tier] || 0) + 1;
    })
  );
  const tierSegments = Object.entries(TIER_COLORS)
    .map(([tier, c]) => ({ label: tier, value: tierCount[tier] || 0, color: c.color }))
    .filter((s) => s.value > 0);

  /* Activity feed */
  const activity = buildActivity(customers);

  /* Top-tier customers (Gold or Platinum first) */
  const topCustomers = [...customers]
    .filter((c) => {
      const tiers = Object.values(c.tier_and_details || {});
      return tiers.some((t) => t.tier === "Gold" || t.tier === "Platinum");
    })
    .slice(0, 5);

  const kpis = [
    { num: stats.total,      lbl: "Total Customers", trend: 4.2  },
    { num: active,           lbl: "Active",  accent: true, trend: 2.1 },
    { num: inactive,         lbl: "Inactive", trend: -1.5 },
    { num: products.length,  lbl: "Products"          },
    { num: pagination.total, lbl: "Filtered"           },
  ];

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Welcome ── */}
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Dashboard
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text3)" }}>
          Welcome back, {user?.displayName?.split(" ")[0] || "there"} 👋 — here's your snapshot.
        </p>
      </div>

      {/* ── KPI tiles ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "16px" }}>
        {kpis.map((t) => <StatCard key={t.lbl} {...t} />)}
      </div>

      {/* ── Middle row: ratio bar + tier donut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Active / Inactive ratio */}
        <Card title="Activation Rate">
          {/* Big percentage hero */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "18px" }}>
            <span style={{ fontSize: "52px", fontWeight: 900, color: "var(--accent)", lineHeight: 1, letterSpacing: "-2px" }}>
              {activeRatio}%
            </span>
            <span style={{ fontSize: "13px", color: "var(--text3)", paddingBottom: "8px" }}>of customers active</span>
          </div>

          {/* Segmented bar */}
          <div style={{ display: "flex", height: "14px", borderRadius: "99px", overflow: "hidden", marginBottom: "10px" }}>
            <div style={{ width: `${activeRatio}%`, background: "linear-gradient(90deg,#e94560,#f97316)", transition: "width 0.6s ease" }} />
            <div style={{ flex: 1, background: "var(--bg3)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 700 }}>● Active {active}</span>
            <span style={{ fontSize: "12px", color: "var(--text3)", fontWeight: 600 }}>Inactive {inactive} ●</span>
          </div>
        </Card>

        {/* Tier donut */}
        <Card title="Customer Tiers">
          {tierSegments.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <DonutChart segments={tierSegments} size={110} />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                {tierSegments.map((s) => {
                  const tc = TIER_COLORS[s.label];
                  const pct = customers.length > 0 ? Math.round((s.value / customers.length) * 100) : 0;
                  return (
                    <div key={s.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: tc?.color }}>{s.label}</span>
                        <span style={{ fontSize: "12px", color: "var(--text2)" }}>{s.value} · {pct}%</span>
                      </div>
                      <div style={{ height: "4px", borderRadius: "99px", background: "var(--bg3)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: "99px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--text3)", fontSize: "13px" }}>No tier data on this page</div>
          )}
        </Card>
      </div>

      {/* ── Bottom row: top customers + activity feed ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Top-tier customers */}
        <Card title="Top-Tier Customers">
          {topCustomers.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>No Gold / Platinum customers on this page.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topCustomers.map((c) => {
                const tiers = Object.values(c.tier_and_details || {});
                const top   = tiers.find((t) => t.tier === "Platinum") || tiers.find((t) => t.tier === "Gold");
                const tc    = top ? TIER_COLORS[top.tier] : null;
                return (
                  <div key={c._id} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: "var(--bg3)", border: "1px solid var(--border)",
                  }}>
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.username)}&background=e94560&color=fff&size=28`}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0 }}
                      alt=""
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", truncate: true }}>{c.name || c.username}</div>
                      <div style={{ fontSize: "11px", color: "var(--text3)" }}>@{c.username}</div>
                    </div>
                    {tc && (
                      <span style={{
                        fontSize: "10px", fontWeight: 800, padding: "2px 8px",
                        borderRadius: "99px", whiteSpace: "nowrap",
                        color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`,
                      }}>
                        {top.tier}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent activity feed */}
        <Card title="Recent Activity">
          {activity.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>No recent activity.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {activity.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "10px 0",
                  borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  {/* Dot */}
                  <div style={{
                    marginTop: "5px", width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: a.active ? "var(--green)" : "var(--text3)",
                    boxShadow: a.active ? "0 0 6px var(--green)" : "none",
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                      {a.name}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}> {a.action}</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text3)", flexShrink: 0 }}>{a.when}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
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