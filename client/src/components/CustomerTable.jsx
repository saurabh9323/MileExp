/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
/* ═══════════════════════════════════════════════════════
   CustomerTable.jsx  —  App shell
   Handles: sidebar, top bar, nav state, data fetching.
   Each view is a fully separate component in /views/.

   Nav routing:
     dashboard → DashboardView  (stats + ratio + quick actions)
     customers → CustomersView  (search + table + pagination)
     analytics → AnalyticsView  (charts + tier breakdown)
     alerts    → AlertsView     (flagged customers)
     settings  → SettingsView   (theme + prefs)
═══════════════════════════════════════════════════════ */
import { useEffect, useState, useCallback } from "react";
import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import { getCustomers, getCustomerStats, getProducts } from "../services/api";

/* ── Views ── */
import DashboardView  from "./views/DashboardView";
import CustomersView  from "./views/CustomersView";
import AnalyticsView  from "./views/AnalyticsView";
import AlertsView     from "./views/AlertsView";
import SettingsView   from "./views/SettingsView";

/* ── Modals ── */
import TransactionModal from "./TransactionModal";
import UserProfile      from "./UserProfile";

/* ── Icons ── */
import {
  IconDashboard, IconCustomers, IconAnalytics,
  IconAlerts, IconSettings, IconChevron,
  IconThemeDark, IconThemeLight, IconMenu, IconClose,
} from "./icons/index.jsx";

/* ─── Nav config ─────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: IconDashboard },
  { id: "customers", label: "Customers", icon: IconCustomers },
  { id: "analytics", label: "Analytics", icon: IconAnalytics },
  { id: "alerts",    label: "Alerts",    icon: IconAlerts    },
  { id: "settings",  label: "Settings",  icon: IconSettings  },
];

const LIMIT = 15;

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function CustomerTable() {
  const { user }               = useAuth();
  const { theme, toggleTheme } = useTheme();

  /* ── Layout ── */
  const [activeNav,     setActiveNav]     = useState("dashboard");
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  /* ── Data ── */
  const [customers,  setCustomers]  = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats,      setStats]      = useState({ total: 0, active: 0 });
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  /* ── Table / filter state ── */
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showProfile,     setShowProfile]     = useState(false);
  const [expandedRow,     setExpandedRow]     = useState(null);
  const [search,          setSearch]          = useState("");
  const [activeFilter,    setActiveFilter]    = useState("all");
  const [page,            setPage]            = useState(1);

  /* ── Fetch customers (pagination, search, filter) ── */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (activeFilter !== "all") params.active = activeFilter;
      if (search.trim())          params.search  = search.trim();
      const res = await getCustomers(params);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load customers. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [page, activeFilter, search]);

  useEffect(() => {
    getCustomerStats().then((r) => setStats(r.data)).catch(() => {});
    getProducts().then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  /* ── Handlers ── */
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFilter = (val) => { setActiveFilter(val); setPage(1); };
  const toggleRow    = (id) => setExpandedRow((prev) => (prev === id ? null : id));

  const SIDEBAR_W      = sidebarOpen ? 240 : 68;
  const currentNavItem = NAV_ITEMS.find((n) => n.id === activeNav);

  /* ─── Sidebar inner content (shared desktop + mobile) ─── */
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
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); if (mobile) setMobileSidebar(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: sidebarOpen || mobile ? "10px 14px" : "10px 0",
                justifyContent: sidebarOpen || mobile ? "flex-start" : "center",
                borderRadius: "10px", border: "none",
                background: isActive ? "rgba(233,69,96,0.12)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text2)",
                fontFamily: "inherit", fontSize: "13.5px", fontWeight: isActive ? 700 : 500,
                cursor: "pointer", transition: "all 0.15s", width: "100%",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; } }}
            >
              <span style={{ flexShrink: 0 }}><Icon /></span>
              {(sidebarOpen || mobile) && <span>{item.label}</span>}
              {isActive && (sidebarOpen || mobile) && (
                <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: theme + collapse */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: sidebarOpen ? "9px 14px" : "9px 0",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            borderRadius: "10px", border: "none",
            background: "transparent", color: "var(--text2)",
            fontFamily: "inherit", fontSize: "13px", fontWeight: 500, cursor: "pointer",
          }}
        >
          {theme === "dark" ? <IconThemeDark /> : <IconThemeLight />}
          {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {!mobile && (
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: sidebarOpen ? "9px 14px" : "9px 0",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              borderRadius: "10px", border: "none",
              background: "transparent", color: "var(--text3)",
              fontFamily: "inherit", fontSize: "13px", cursor: "pointer",
            }}
          >
            <IconChevron dir={sidebarOpen ? "left" : "right"} />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: `${SIDEBAR_W}px`, flexShrink: 0,
        background: "var(--bg2)", borderRight: "1px solid var(--border)",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        transition: "width 0.2s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column", zIndex: 40,
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <>
          <div
            onClick={() => setMobileSidebar(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60, backdropFilter: "blur(4px)" }}
          />
          <aside style={{
            position: "fixed", left: 0, top: 0, bottom: 0, width: "260px",
            background: "var(--bg2)", borderRight: "1px solid var(--border)",
            zIndex: 70, overflowY: "auto", overflowX: "hidden",
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px" }}>
              <button
                onClick={() => setMobileSidebar(false)}
                style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text2)", padding: "6px", cursor: "pointer" }}
              >
                <IconClose />
              </button>
            </div>
            <SidebarContent mobile />
          </aside>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Top bar */}
        <header style={{
          height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", borderBottom: "1px solid var(--border)",
          background: "var(--bg2)", flexShrink: 0, gap: "16px",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <button
            className="lg:hidden"
            onClick={() => setMobileSidebar(true)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text2)", padding: "6px", cursor: "pointer" }}
          >
            <IconMenu />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "var(--text3)", fontWeight: 600 }}>
              {currentNavItem?.label}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            <button
              onClick={() => setShowProfile(true)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "var(--bg3)", border: "1px solid var(--border2)",
                borderRadius: "10px", padding: "5px 10px",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
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

        {/* ── Page content ── */}
        <div style={{ flex: 1, overflow: "auto" }}>

          {activeNav === "dashboard" && (
            <DashboardView
              user={user}
              stats={stats}
              products={products}
              customers={customers}
              pagination={pagination}
            />
          )}

          {activeNav === "customers" && (
            <CustomersView
              customers={customers}
              pagination={pagination}
              loading={loading}
              error={error}
              search={search}
              activeFilter={activeFilter}
              page={page}
              expandedRow={expandedRow}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onPageChange={setPage}
              onToggleRow={toggleRow}
              onSelectAccount={setSelectedAccount}
            />
          )}

          {activeNav === "analytics" && (
            <AnalyticsView stats={stats} products={products} customers={customers} />
          )}

          {activeNav === "alerts" && (
            <AlertsView customers={customers} />
          )}

          {activeNav === "settings" && (
            <SettingsView theme={theme} toggleTheme={toggleTheme} />
          )}

        </div>
      </main>

      {/* Modals */}
      {selectedAccount !== null && (
        <TransactionModal accountId={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}