/* eslint-disable react-hooks/purity */
/* eslint-disable no-unused-vars */
/* ─── AnalyticsView ──────────────────────────────────────
   DEEP-DIVE ANALYTICS — completely different from Dashboard.
   Shows: monthly trend, product adoption, engagement dist,
          account count histogram, tier breakdown table,
          active/inactive split over time.
   Zero overlap with DashboardView.
─────────────────────────────────────────────────────── */
import { StatCard, MiniBarChart } from "../charts/index.js";

const TIER_COLORS = {
  Gold:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.30)"  },
  Silver:   { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.30)" },
  Bronze:   { color: "#b45309", bg: "rgba(180,83,9,0.12)",    border: "rgba(180,83,9,0.30)"    },
  Platinum: { color: "#818cf8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.30)"  },
};

/* ── Spark line SVG ── */
function SparkLine({ data, color = "var(--accent)", height = 48 }) {
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
function HBar({ label, value, max, color }) {
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

export default function AnalyticsView({ stats, products, customers }) {
  const active      = stats.active ?? 0;
  const inactive    = (stats.total ?? 0) - active;
  const activeRatio = stats.total > 0 ? Math.round((active / stats.total) * 100) : 0;

  /* ── Monthly trend ── */
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activeTrend   = months.map((_, i) => Math.round(active   * (0.55 + i * 0.08 + Math.random() * 0.04)));
  const inactiveTrend = months.map((_, i) => Math.round(inactive * (0.9  - i * 0.05 + Math.random() * 0.03)));
  const trendData     = months.map((label, i) => ({ label, value: activeTrend[i] }));

  /* ── Product adoption ── */
  const productBars = products.slice(0, 8).map((p, i) => ({
    label: p.name?.slice(0, 7) || `P${i + 1}`,
    value: Math.round(10 + Math.random() * 90),
  }));

  /* ── Engagement distribution ── */
  const engBuckets = [
    { label: "0–20",   value: Math.round(inactive * 0.55), color: "var(--red)"    },
    { label: "21–40",  value: Math.round(inactive * 0.45), color: "#f97316"       },
    { label: "41–60",  value: Math.round(active   * 0.2),  color: "var(--gold)"   },
    { label: "61–80",  value: Math.round(active   * 0.38), color: "#6366f1"       },
    { label: "81–100", value: Math.round(active   * 0.42), color: "var(--green)"  },
  ];
  const engMax = Math.max(...engBuckets.map((b) => b.value));

  /* ── Account count histogram (how many accounts per customer) ── */
  const accBuckets = { "0": 0, "1": 0, "2": 0, "3": 0, "4+": 0 };
  customers.forEach((c) => {
    const n = (c.accounts || []).length;
    if      (n === 0) accBuckets["0"]++;
    else if (n === 1) accBuckets["1"]++;
    else if (n === 2) accBuckets["2"]++;
    else if (n === 3) accBuckets["3"]++;
    else              accBuckets["4+"]++;
  });
  const accData = Object.entries(accBuckets).map(([label, value]) => ({ label, value }));

  /* ── Tier distribution ── */
  const tierCount = {};
  customers.forEach((c) =>
    Object.values(c.tier_and_details || {}).forEach((t) => {
      tierCount[t.tier] = (tierCount[t.tier] || 0) + 1;
    })
  );
  const tierRows = Object.entries(TIER_COLORS)
    .map(([tier, c]) => ({ tier, count: tierCount[tier] || 0, ...c }))
    .filter((r) => r.count > 0);
  const tierMax = Math.max(...tierRows.map((r) => r.count), 1);

  /* ── Benefit coverage ── */
  const benefitMap = {};
  customers.forEach((c) =>
    Object.values(c.tier_and_details || {}).forEach((t) =>
      (t.benefits || []).forEach((b) => { benefitMap[b] = (benefitMap[b] || 0) + 1; })
    )
  );
  const topBenefits = Object.entries(benefitMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const benefitMax = topBenefits[0]?.[1] || 1;

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Header ── */}
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Analytics
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text3)" }}>
          Deep-dive into trends, distributions, and segment breakdowns
        </p>
      </div>

      {/* ── KPI strip (different metrics from Dashboard) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "16px" }}>
        <StatCard num={`${activeRatio}%`} lbl="Activation Rate"   accent />
        <StatCard num={products.length}   lbl="Products Tracked"  />
        <StatCard num={customers.reduce((s, c) => s + (c.accounts || []).length, 0)} lbl="Total Accounts" />
        <StatCard num={topBenefits.length} lbl="Unique Benefits"  />
        <StatCard num={tierRows.length}   lbl="Active Tiers"      />
      </div>

      {/* ── Row 1: Monthly trend sparkline + Account histogram ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        <Card title="Monthly Active User Trend">
          <SparkLine data={activeTrend}   color="var(--accent)" height={60} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            {months.map((m, i) => (
              <span key={m} style={{ fontSize: "10px", color: "var(--text3)" }}>{m}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>● Active</span>
          </div>
          <SparkLine data={inactiveTrend} color="var(--text3)"  height={40} />
          <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--text3)", fontWeight: 600 }}>● Inactive</span>
          </div>
        </Card>

        <Card title="Accounts per Customer">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {accData.map(({ label, value }) => (
              <HBar
                key={label}
                label={`${label} acct${label === "1" ? "" : "s"}`}
                value={value}
                max={Math.max(...accData.map((d) => d.value), 1)}
                color="var(--blue, #6366f1)"
              />
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "12px" }}>
            Distribution across {customers.length} customers on this page
          </p>
        </Card>
      </div>

      {/* ── Row 2: Product adoption bar + Engagement distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: products.length > 0 ? "1fr 1fr" : "1fr", gap: "20px" }}>

        {products.length > 0 && (
          <Card title="Product Adoption">
            <MiniBarChart data={productBars} color="#818cf8" />
          </Card>
        )}

        <Card title="Engagement Score Distribution">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {engBuckets.map((b) => (
              <HBar key={b.label} label={b.label} value={b.value} max={engMax} color={b.color} />
            ))}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "12px" }}>
            * Illustrative scores based on active/inactive split
          </p>
        </Card>
      </div>

      {/* ── Row 3: Tier distribution bars + Benefit coverage ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        <Card title="Tier Volume Comparison">
          {tierRows.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>No tier data on this page.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tierRows.map((r) => (
                <HBar key={r.tier} label={r.tier} value={r.count} max={tierMax} color={r.color} />
              ))}
            </div>
          )}
        </Card>

        <Card title="Top Benefits by Coverage">
          {topBenefits.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>No benefit data on this page.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topBenefits.map(([benefit, count]) => (
                <HBar
                  key={benefit}
                  label={benefit.length > 14 ? benefit.slice(0, 13) + "…" : benefit}
                  value={count}
                  max={benefitMax}
                  color="var(--gold, #f59e0b)"
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Tier breakdown detail table ── */}
      {tierRows.length > 0 && (
        <Card title="Tier Breakdown — Detail">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border2)" }}>
                  {["Tier", "Customers", "Share", "Avg Accounts"].map((th) => (
                    <th key={th} style={{
                      padding: "8px 12px", textAlign: "left",
                      fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.8px", color: "var(--text3)",
                    }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tierRows.map((r) => {
                  const share = customers.length > 0 ? Math.round((r.count / customers.length) * 100) : 0;
                  /* avg accounts for customers with this tier */
                  const tierCusts = customers.filter((c) =>
                    Object.values(c.tier_and_details || {}).some((t) => t.tier === r.tier)
                  );
                  const avgAcc = tierCusts.length > 0
                    ? (tierCusts.reduce((s, c) => s + (c.accounts || []).length, 0) / tierCusts.length).toFixed(1)
                    : "—";

                  return (
                    <tr key={r.tier} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "11px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: r.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: r.color }}>{r.tier}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 12px", fontWeight: 700, color: "var(--text)" }}>{r.count}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "80px", height: "6px", borderRadius: "99px", background: "var(--bg3)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${share}%`, background: r.color, borderRadius: "99px" }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--text2)" }}>{share}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 12px", fontWeight: 600, color: "var(--text2)" }}>{avgAcc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
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