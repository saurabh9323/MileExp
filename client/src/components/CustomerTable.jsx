import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getCustomers, getCustomerStats, getProducts, getLowAmountAccounts } from "../services/api";
import TransactionModal from "./TransactionModal";
import UserProfile from "./UserProfile";

/* ─── Constants ─────────────────────────────────────── */
const TIER_COLORS = {
  Gold:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.30)" },
  Silver:   { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.30)" },
  Bronze:   { color: "#b45309", bg: "rgba(180,83,9,0.12)", border: "rgba(180,83,9,0.30)" },
  Platinum: { color: "#818cf8", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.30)" },
};

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",   icon: IconDashboard },
  { id: "customers",  label: "Customers",   icon: IconCustomers },
  { id: "analytics",  label: "Analytics",   icon: IconAnalytics },
  { id: "alerts",     label: "Alerts",      icon: IconAlerts },
  { id: "settings",   label: "Settings",    icon: IconSettings },
];

/* ─── SVG Icons ─────────────────────────────────────── */
function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconCustomers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconAnalytics() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function IconAlerts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IconChevron({ dir = "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === "left" ? "rotate(180deg)" : dir === "up" ? "rotate(-90deg)" : dir === "down" ? "rotate(90deg)" : "none" }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconThemeDark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function IconThemeLight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

/* ─── Sub-components ─────────────────────────────────── */
function TierPill({ tier }) {
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

function StatCard({ num, lbl, accent, trend, icon }) {
  return (
    <div style={{
      background: accent ? "linear-gradient(135deg, rgba(233,69,96,0.12), rgba(199,48,80,0.08))" : "var(--bg2)",
      border: accent ? "1px solid rgba(233,69,96,0.25)" : "1px solid var(--border2)",
      borderRadius: "16px", padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: "8px",
      position: "relative", overflow: "hidden",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)" }}>{lbl}</span>
        {icon && <span style={{ color: accent ? "var(--accent)" : "var(--text3)", opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: "32px", fontWeight: 800, color: accent ? "var(--accent)" : "var(--text)", letterSpacing: "-1px", lineHeight: 1 }}>
        {num?.toLocaleString() ?? "—"}
      </div>
      {trend !== undefined && (
        <div style={{ fontSize: "12px", color: trend >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

/* ─── Mini Bar Chart (SVG) ────────────────────────────── */
function MiniBarChart({ data, color = "var(--accent)" }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  const W = 300, H = 80, gap = 4;
  const barW = (W - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = max > 0 ? (d.value / max) * H : 0;
        const x = i * (barW + gap);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} opacity="0.75"/>
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize="9" fill="var(--text3)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Donut Chart (SVG) ───────────────────────────────── */
function DonutChart({ segments, size = 120 }) {
  const r = 42, cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg3)" strokeWidth="16"/>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}/>
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--text)">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--text3)">Total</text>
    </svg>
  );
}

/* ─── Analytics View ────────────────────────────────────── */
function AnalyticsView({ stats, products, customers }) {
  const active = stats.active ?? 0;
  const inactive = (stats.total ?? 0) - active;

  // Tier distribution from customers
  const tierCount = {};
  customers.forEach(c => {
    const tiers = Object.values(c.tier_and_details || {});
    tiers.forEach(t => { tierCount[t.tier] = (tierCount[t.tier] || 0) + 1; });
  });

  const tierSegments = Object.entries(TIER_COLORS).map(([tier, c]) => ({
    label: tier, value: tierCount[tier] || 0, color: c.color,
  })).filter(s => s.value > 0);

  // Fake monthly active user trend for demo
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec"];
  const trendData = months.map((label, i) => ({
    label, value: Math.round(active * (0.6 + i * 0.07 + Math.random() * 0.05)),
  }));

  const productData = products.slice(0, 6).map((p, i) => ({
    label: p.name?.slice(0, 6) || `P${i+1}`,
    value: Math.round(20 + Math.random() * 80),
  }));

  return (
    <div style={{ padding: "28px 28px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>Analytics</h2>
        <p style={{ fontSize: "13px", color: "var(--text3)" }}>Overview of your customer base and product distribution</p>
      </div>

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
        <StatCard num={stats.total} lbl="Total Customers" trend={4.2} />
        <StatCard num={active} lbl="Active" accent trend={2.1} />
        <StatCard num={inactive} lbl="Inactive" trend={-1.5} />
        <StatCard num={products.length} lbl="Products" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Monthly trend */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", marginBottom: "16px" }}>Active Users — Last 6 Months</div>
          <MiniBarChart data={trendData} color="var(--accent)" />
        </div>

        {/* Tier distribution donut */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", marginBottom: "16px" }}>Tier Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {tierSegments.length > 0
              ? <DonutChart segments={tierSegments} size={110} />
              : <div style={{ color: "var(--text3)", fontSize: "13px" }}>No tier data on this page</div>
            }
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tierSegments.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "var(--text2)" }}>{s.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", marginLeft: "auto" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product usage */}
      {products.length > 0 && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", marginBottom: "16px" }}>Product Adoption (Sample)</div>
          <MiniBarChart data={productData} color="#818cf8" />
        </div>
      )}

      {/* Active vs Inactive horizontal bar */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "16px", padding: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--text3)", marginBottom: "14px" }}>Active / Inactive Ratio</div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "12px", borderRadius: "99px", background: "var(--bg3)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${stats.total > 0 ? (active / stats.total) * 100 : 0}%`,
              background: "linear-gradient(90deg, #e94560, #f97316)",
              borderRadius: "99px", transition: "width 0.5s ease",
            }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)", minWidth: "40px" }}>
            {stats.total > 0 ? Math.round((active / stats.total) * 100) : 0}%
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--green)" }}>● Active: {active}</span>
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>● Inactive: {inactive}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Alerts View ─────────────────────────────────────── */
function AlertsView({ customers }) {
  // Flag customers with no active tier
  const noActiveTier = customers.filter(c => {
    const tiers = Object.values(c.tier_and_details || {});
    return !tiers.some(t => t.active);
  });

  return (
    <div style={{ padding: "28px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>Alerts</h2>
      <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "24px" }}>Flagged customers and system notifications</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Low transactions banner */}
        <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: "14px", padding: "16px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚑</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--red)", marginBottom: "4px" }}>Low-Amount Transaction Monitor</div>
            <div style={{ fontSize: "13px", color: "var(--text2)" }}>Transactions below $5,000 are flagged in red in the Transaction History modal. Click any account ID in the Customers view to inspect.</div>
          </div>
        </div>

        {/* No active tier */}
        {noActiveTier.length > 0 && (
          <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "14px", padding: "16px 20px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#f59e0b", marginBottom: "10px" }}>⚠ Customers Without Active Tier ({noActiveTier.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {noActiveTier.slice(0, 20).map(c => (
                <span key={c._id} style={{
                  fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "8px",
                  background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)",
                }}>@{c.username}</span>
              ))}
              {noActiveTier.length > 20 && <span style={{ fontSize: "12px", color: "var(--text3)" }}>+{noActiveTier.length - 20} more</span>}
            </div>
          </div>
        )}

        {noActiveTier.length === 0 && (
          <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "20px" }}>✅</span>
            <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>All customers on this page have at least one active tier.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Settings View ───────────────────────────────────── */
function SettingsView({ theme, toggleTheme }) {
  return (
    <div style={{ padding: "28px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>Settings</h2>
      <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "24px" }}>Application preferences</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
        <SettingRow label="Theme" desc={`Currently: ${theme === "dark" ? "Dark" : "Light"} mode`}>
          <button onClick={toggleTheme} style={{
            padding: "8px 16px", borderRadius: "10px", border: "1px solid var(--border2)",
            background: "var(--bg3)", color: "var(--text)", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          }}>
            {theme === "dark" ? <IconThemeDark /> : <IconThemeLight />}
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </SettingRow>

        <SettingRow label="API Endpoint" desc="Backend server URL">
          <code style={{ fontSize: "12px", color: "var(--text3)", background: "var(--bg3)", padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
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
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────── */
function PgBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="min-w-[36px] h-9 px-3 text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderRadius: "8px",
        background: active ? "var(--accent)" : "var(--bg3)",
        color: active ? "#fff" : "var(--text2)",
        border: active ? "1px solid var(--accent)" : "1px solid var(--border2)",
      }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function CustomerTable() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeNav, setActiveNav]       = useState("dashboard");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [customers, setCustomers]       = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats]               = useState({ total: 0, active: 0 });
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showProfile, setShowProfile]   = useState(false);
  const [expandedRow, setExpandedRow]   = useState(null);
  const [search, setSearch]             = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage]                 = useState(1);
  const LIMIT = 15;

  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, limit: LIMIT };
      if (activeFilter !== "all") params.active = activeFilter;
      if (search.trim()) params.search = search.trim();
      const res = await getCustomers(params);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load customers. Is the server running?");
    } finally { setLoading(false); }
  }, [page, activeFilter, search]);

  useEffect(() => {
    getCustomerStats().then(r => setStats(r.data)).catch(() => {});
    getProducts().then(r => setProducts(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFilter = (val) => { setActiveFilter(val); setPage(1); };
  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  const SIDEBAR_W = sidebarOpen ? 240 : 68;

  const statTiles = [
    { num: stats.total, lbl: "Total Customers" },
    { num: stats.active, lbl: "Active", accent: true },
    { num: stats.total - stats.active, lbl: "Inactive" },
    { num: products.length, lbl: "Products" },
    { num: pagination.total, lbl: "Matching" },
  ];

  /* ── SIDEBAR ──────────────────────────────────────── */
  const SidebarContent = ({ mobile = false }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <div style={{
        padding: sidebarOpen || mobile ? "20px 20px 16px" : "20px 0 16px",
        display: "flex", alignItems: "center", gap: "12px",
        justifyContent: sidebarOpen || mobile ? "flex-start" : "center",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg, #e94560, #c73050)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(233,69,96,0.35)",
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M12 36L24 12L36 36" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 28L32 28" stroke="#fff" strokeWidth="4.5" strokeLinecap="round"/>
          </svg>
        </div>
        {(sidebarOpen || mobile) && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text)", lineHeight: 1, letterSpacing: "-0.3px" }}>MileExp</div>
            <div style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "0.4px", marginTop: "2px" }}>Banking Analytics</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map(item => {
          const active = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setActiveNav(item.id); if (mobile) setMobileSidebar(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: sidebarOpen || mobile ? "10px 14px" : "10px 0",
                justifyContent: sidebarOpen || mobile ? "flex-start" : "center",
                borderRadius: "10px", border: "none",
                background: active ? "rgba(233,69,96,0.12)" : "transparent",
                color: active ? "var(--accent)" : "var(--text2)",
                fontFamily: "inherit", fontSize: "13.5px", fontWeight: active ? 700 : 500,
                cursor: "pointer", transition: "all 0.15s", width: "100%",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; } }}
            >
              <span style={{ flexShrink: 0 }}><Icon /></span>
              {(sidebarOpen || mobile) && <span>{item.label}</span>}
              {active && (sidebarOpen || mobile) && (
                <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: theme + collapse */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <button onClick={toggleTheme} style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: sidebarOpen ? "9px 14px" : "9px 0",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          borderRadius: "10px", border: "none",
          background: "transparent", color: "var(--text2)",
          fontFamily: "inherit", fontSize: "13px", fontWeight: 500, cursor: "pointer",
        }}>
          {theme === "dark" ? <IconThemeDark /> : <IconThemeLight />}
          {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {!mobile && (
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: sidebarOpen ? "9px 14px" : "9px 0",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            borderRadius: "10px", border: "none",
            background: "transparent", color: "var(--text3)",
            fontFamily: "inherit", fontSize: "13px", cursor: "pointer",
          }}>
            <IconChevron dir={sidebarOpen ? "left" : "right"} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  /* ── HEADER ───────────────────────────────────────── */
  const currentNavItem = NAV_ITEMS.find(n => n.id === activeNav);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: `${SIDEBAR_W}px`, flexShrink: 0,
        background: "var(--bg2)", borderRight: "1px solid var(--border)",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        transition: "width 0.2s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
        zIndex: 40,
      }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebar && (
        <>
          <div onClick={() => setMobileSidebar(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60,
            backdropFilter: "blur(4px)",
          }} />
          <aside style={{
            position: "fixed", left: 0, top: 0, bottom: 0, width: "260px",
            background: "var(--bg2)", borderRight: "1px solid var(--border)",
            zIndex: 70, overflowY: "auto", overflowX: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px" }}>
              <button onClick={() => setMobileSidebar(false)} style={{
                background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px",
                color: "var(--text2)", padding: "6px", cursor: "pointer",
              }}><IconClose /></button>
            </div>
            <SidebarContent mobile />
          </aside>
        </>
      )}

      {/* ── Main Content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Top bar */}
        <header style={{
          height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", borderBottom: "1px solid var(--border)",
          background: "var(--bg2)", flexShrink: 0, gap: "16px",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          {/* Mobile menu */}
          <button className="lg:hidden" onClick={() => setMobileSidebar(true)} style={{
            background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--text2)", padding: "6px", cursor: "pointer",
          }}><IconMenu /></button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "var(--text3)", fontWeight: 600 }}>{currentNavItem?.label}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            {/* User avatar */}
            <button onClick={() => setShowProfile(true)} style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--bg3)", border: "1px solid var(--border2)",
              borderRadius: "10px", padding: "5px 10px",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}
            >
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=e94560&color=fff&size=32`}
                alt="avatar"
                style={{ width: "24px", height: "24px", borderRadius: "6px", objectFit: "cover" }}
              />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto" }}>

          {/* ── DASHBOARD ── */}
          {(activeNav === "dashboard" || activeNav === "customers") && (
            <div>
              {/* Stats row */}
              <div style={{ padding: "24px 24px 0" }}>
                {activeNav === "dashboard" && (
                  <div style={{ marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>Dashboard</h2>
                    <p style={{ fontSize: "13px", color: "var(--text3)" }}>Welcome back, {user?.displayName?.split(" ")[0] || "there"} 👋</p>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                  {statTiles.map((t) => (
                    <StatCard key={t.lbl} {...t} />
                  ))}
                </div>
              </div>

              {/* Search + Filters */}
              <div style={{ padding: "0 24px 16px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "var(--bg2)", border: "1px solid var(--border2)",
                  borderRadius: "10px", padding: "8px 14px", flex: "1", minWidth: "200px",
                }}>
                  <span style={{ color: "var(--text3)", flexShrink: 0 }}><IconSearch /></span>
                  <input
                    value={search} onChange={handleSearch}
                    placeholder="Search by name, email, username…"
                    style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: "13px", width: "100%" }}
                  />
                </div>

                {/* Filter pills */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {[["all", "All"], ["true", "Active"], ["false", "Inactive"]].map(([val, lbl]) => (
                    <button key={val} onClick={() => handleFilter(val)} style={{
                      padding: "8px 14px", borderRadius: "10px", border: "1px solid",
                      fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      background: activeFilter === val ? "var(--accent)" : "var(--bg2)",
                      color: activeFilter === val ? "#fff" : "var(--text2)",
                      borderColor: activeFilter === val ? "var(--accent)" : "var(--border2)",
                      transition: "all 0.15s",
                    }}>{lbl}</button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div style={{ padding: "0 24px 24px" }}>
                <div style={{
                  background: "var(--bg2)", border: "1px solid var(--border2)",
                  borderRadius: "16px", overflow: "hidden",
                }}>
                  {error && (
                    <div style={{ padding: "20px 24px", color: "var(--red)", fontSize: "13px", background: "rgba(244,63,94,0.07)", borderBottom: "1px solid var(--border)" }}>
                      ⚠ {error}
                    </div>
                  )}

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
                      <thead>
                        <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border2)" }}>
                          {["", "Customer", "Email", "Status", "Tier", "Accounts"].map(th => (
                            <th key={th} style={{
                              padding: "12px 16px", textAlign: "left",
                              fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
                              letterSpacing: "0.9px", color: "var(--text3)", whiteSpace: "nowrap",
                            }}>{th}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="6" style={{ padding: "48px 24px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: "32px", height: "32px", border: "3px solid var(--accent2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                              <span style={{ fontSize: "13px", color: "var(--text3)" }}>Loading customers…</span>
                            </div>
                          </td></tr>
                        ) : customers.length === 0 ? (
                          <tr><td colSpan="6" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
                            No customers found.
                          </td></tr>
                        ) : customers.map(c => {
                          const tierList = Object.values(c.tier_and_details || {});
                          const isExpanded = expandedRow === c._id;
                          return (
                            <>
                              <tr key={c._id}
                                onClick={() => toggleRow(c._id)}
                                style={{
                                  borderBottom: "1px solid var(--border)", cursor: "pointer",
                                  background: isExpanded ? "var(--bg3)" : "transparent",
                                  transition: "background 0.1s",
                                }}
                                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "var(--bg3)"; }}
                                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                              >
                                {/* Expand chevron */}
                                <td style={{ width: "40px", padding: "14px 8px 14px 16px" }}>
                                  <span style={{ color: "var(--text3)", display: "block", transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "" }}>
                                    <IconChevron />
                                  </span>
                                </td>

                                {/* Customer */}
                                <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.username)}&background=e94560&color=fff&size=32`}
                                      style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                                      alt=""
                                    />
                                    <div>
                                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{c.name || "—"}</div>
                                      <div style={{ fontSize: "11px", color: "var(--text3)" }}>@{c.username}</div>
                                    </div>
                                  </div>
                                </td>

                                {/* Email */}
                                <td style={{ padding: "14px 16px" }}>
                                  <span style={{ fontSize: "12px", color: "var(--text2)" }}>{c.email || "—"}</span>
                                </td>

                                {/* Status */}
                                <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "5px",
                                    fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px",
                                    background: c.active ? "rgba(16,185,129,0.1)" : "rgba(139,139,176,0.1)",
                                    color: c.active ? "var(--green)" : "var(--text3)",
                                  }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.active ? "var(--green)" : "var(--text3)", flexShrink: 0 }} />
                                    {c.active ? "Active" : "Inactive"}
                                  </span>
                                </td>

                                {/* Tier */}
                                <td style={{ padding: "14px 16px" }}>
                                  {tierList.length > 0
                                    ? <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>{tierList.map(t => <TierPill key={t.id} tier={t.tier} />)}</div>
                                    : <span style={{ color: "var(--text3)" }}>—</span>
                                  }
                                </td>

                                {/* Accounts */}
                                <td style={{ padding: "14px 16px" }} onClick={e => e.stopPropagation()}>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                    {(c.accounts || []).map(accId => (
                                      <button key={accId} onClick={() => setSelectedAccount(accId)} style={{
                                        fontSize: "11px", fontWeight: 700, fontFamily: "monospace",
                                        padding: "3px 8px", borderRadius: "7px", cursor: "pointer",
                                        background: "var(--acc2)", color: "var(--accent)",
                                        border: "1px solid rgba(233,69,96,0.2)", transition: "all 0.12s",
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = "var(--acc2)"; e.currentTarget.style.color = "var(--accent)"; }}
                                      >#{accId}</button>
                                    ))}
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded tier benefits */}
                              {isExpanded && tierList.length > 0 && (
                                <tr key={`${c._id}-exp`} style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                                  <td colSpan="6" style={{ padding: "16px 24px" }}>
                                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.9px", color: "var(--text3)", marginBottom: "12px" }}>Tier Benefits</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                      {tierList.map(t => {
                                        const c2 = TIER_COLORS[t.tier] || { color: "#8b8bb0", bg: "rgba(139,139,176,0.1)", border: "rgba(139,139,176,0.3)" };
                                        return (
                                          <div key={t.id} style={{ borderRadius: "12px", padding: "14px 16px", minWidth: "200px", flex: "1", background: c2.bg, border: `1px solid ${c2.border}` }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                              <span style={{ fontWeight: 800, fontSize: "13px", color: c2.color }}>{t.tier}</span>
                                              <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px", background: t.active ? "rgba(16,185,129,0.1)" : "var(--bg4)", color: t.active ? "var(--green)" : "var(--text3)" }}>
                                                {t.active ? "Active" : "Inactive"}
                                              </span>
                                            </div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                              {(t.benefits || []).map((b, i) => (
                                                <span key={i} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: c2.bg, color: c2.color, border: `1px solid ${c2.border}` }}>✓ {b}</span>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "14px", borderTop: "1px solid var(--border)" }}>
                      <PgBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</PgBtn>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                        .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
                        .map((p, i) => p === "..." ? (
                          <span key={`e${i}`} style={{ padding: "0 6px", color: "var(--text3)", fontSize: "12px" }}>…</span>
                        ) : (
                          <PgBtn key={p} active={page === p} onClick={() => setPage(p)}>{p}</PgBtn>
                        ))}
                      <PgBtn onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}>Next →</PgBtn>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeNav === "analytics" && <AnalyticsView stats={stats} products={products} customers={customers} />}
          {activeNav === "alerts" && <AlertsView customers={customers} />}
          {activeNav === "settings" && <SettingsView theme={theme} toggleTheme={toggleTheme} />}
        </div>
      </main>

      {/* Modals */}
      {selectedAccount !== null && <TransactionModal accountId={selectedAccount} onClose={() => setSelectedAccount(null)} />}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </div>
  );
}