import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getCustomers, getCustomerStats, getProducts } from "../services/api";
import TransactionModal from "./TransactionModal";
import UserProfile from "./UserProfile";

const TIER_COLORS = {
  Gold:     "#f59e0b",
  Silver:   "#94a3b8",
  Bronze:   "#b45309",
  Platinum: "#818cf8",
};

const NAV_LINKS = ["Dashboard", "Analytics", "Reports", "Settings"];

function TierPill({ tier }) {
  const color = TIER_COLORS[tier] || "#8b8bb0";
  return (
    <span
      className="tier-pill"
      style={{ color, borderColor: color + "55", background: color + "18" }}
    >
      {tier}
    </span>
  );
}

function ThemeIcon({ theme }) {
  return theme === "dark" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function CustomerTable() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [customers, setCustomers]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats]           = useState({ total: 0, active: 0 });
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showProfile, setShowProfile]         = useState(false);
  const [expandedRow, setExpandedRow]         = useState(null);
  const [search, setSearch]         = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage]             = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const LIMIT = 15;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (activeFilter !== "all") params.active = activeFilter;
      if (search.trim()) params.search = search.trim();
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

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleFilter = (val) => { setActiveFilter(val); setPage(1); };
  const toggleRow    = (id) => setExpandedRow((prev) => (prev === id ? null : id));

  const statTiles = [
    { num: stats.total,             lbl: "Total Customers", accent: false },
    { num: stats.active,            lbl: "Active",          accent: true  },
    { num: stats.total-stats.active,lbl: "Inactive",        accent: false },
    { num: products.length,         lbl: "Products",        accent: false },
    { num: pagination.total,        lbl: "Matching",        accent: false },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ═══════════════ NAVBAR ═══════════════ */}
   <nav
  className="sticky top-0 z-50"
  style={{
    background: "rgba(13,13,26,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
  }}
>
  <div className="max-w-screen-xl mx-auto px-6">
    <div className="flex items-center justify-between h-16">

      {/* LEFT ─ BRAND */}
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            boxShadow: "0 6px 20px rgba(99,102,241,0.4)"
          }}
        >
          <span className="text-white font-bold">M</span>
        </div>

        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm text-t1">MileExp</span>
          <span className="text-[11px] text-t3">Banking Analytics</span>
        </div>
      </div>

      {/* CENTER ─ NAV LINKS */}
      <div className="hidden md:flex items-center gap-2 bg-[var(--bg3)] px-2 py-1 rounded-full border border-[var(--border)]">

        {NAV_LINKS.map((link, i) => {
          const isActive = i === 0;

          return (
            <button
              key={link}
              className="px-4 py-1.5 text-sm rounded-full transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "var(--accent)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
                    }
                  : {
                      color: "var(--text2)"
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bg4)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text2)";
                }
              }}
            >
              {link}
            </button>
          );
        })}
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">

        {/* Search (NEW 🔥) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border2)] bg-[var(--bg3)]">
          <span className="text-xs text-t3">⌘K</span>
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-32"
          />
        </div>

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg3)] hover:bg-[var(--bg4)] transition"
        >
          <ThemeIcon theme={theme} />
        </button>

        {/* Avatar */}
        <div
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-[var(--bg3)] cursor-pointer transition"
        >
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`}
            className="w-8 h-8 rounded-full border-2 border-[var(--accent)]"
          />
          <span className="hidden sm:block text-sm text-t2 font-medium">
            {user?.displayName}
          </span>
        </div>

      </div>
    </div>
  </div>
</nav>
      {/* ═══════════════ BODY ═══════════════ */}
      <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col flex-1 pb-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 py-5">
          {statTiles.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 py-4 px-3 rounded-r2 transition-all duration-150"
              style={{
                background: s.accent ? "var(--accent2)" : "var(--bg2)",
                border: s.accent ? "1px solid rgba(233,69,96,0.25)" : "1px solid var(--border)",
              }}
            >
              <span
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: s.accent ? "var(--accent)" : "var(--text)" }}
              >
                {s.num}
              </span>
              <span className="text-t3 text-xs font-medium text-center">{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div
          className="rounded-r2 flex flex-col flex-1"
          style={{ background: "var(--bg2)", border: "1px solid var(--border)" }}
        >

          {/* Toolbar */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h2 className="text-t1 font-bold text-lg tracking-tight">Customer Directory</h2>
              <p className="text-t3 text-xs mt-0.5">
                {pagination.total} results · Page {pagination.page} of {pagination.totalPages || 1}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div
                className="flex items-center gap-2 rounded-r px-3 py-2"
                style={{ background: "var(--bg3)", border: "1px solid var(--border2)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text3)", flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="bg-transparent outline-none text-sm w-48 max-w-full"
                  placeholder="Search name, email…"
                  value={search}
                  onChange={handleSearch}
                  style={{ color: "var(--text)", caretColor: "var(--accent)" }}
                />
              </div>

              {/* Filter tabs */}
              <div
                className="flex rounded-r overflow-hidden"
                style={{ border: "1px solid var(--border2)", background: "var(--bg3)" }}
              >
                {[["all", "All"], ["true", "Active"], ["false", "Inactive"]].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => handleFilter(val)}
                    className="px-3.5 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap"
                    style={
                      activeFilter === val
                        ? { background: "var(--accent)", color: "#fff" }
                        : { color: "var(--text2)" }
                    }
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mx-5 mt-4 px-4 py-3 rounded-r text-sm"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "var(--red)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Table — horizontal scroll on small screens */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border2)" }}>
                  {["#", "Name", "Address", "Email", "Status", "Tier", "Accounts"].map((th, i) => (
                    <th
                      key={th}
                      className={`px-4 py-3 text-left font-bold text-t3 tracking-widest uppercase whitespace-nowrap
                        ${th === "Address" ? "hidden md:table-cell" : ""}
                        ${th === "Email" ? "hidden lg:table-cell" : ""}
                      `}
                      style={{ fontSize: "10px", letterSpacing: "0.9px" }}
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{
                            border: "3px solid var(--accent2)",
                            borderTopColor: "var(--accent)",
                            animation: "spin 0.75s linear infinite",
                          }}
                        />
                        <span className="text-t2 text-sm">Loading customers…</span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📋</span>
                        <span className="text-t3 text-sm">No customers match your criteria.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => {
                    const tierList = c.tier_and_details ? Object.values(c.tier_and_details) : [];
                    const isExpanded = expandedRow === c._id;

                    return (
                      <>
                        <tr
                          key={c._id}
                          onClick={() => toggleRow(c._id)}
                          className="cursor-pointer transition-colors duration-100"
                          style={{
                            borderBottom: "1px solid var(--border)",
                            background: isExpanded ? "var(--bg3)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isExpanded) e.currentTarget.style.background = "var(--bg3)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isExpanded) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* # */}
                          <td
                            className="px-4 py-3.5 font-mono text-t3 text-xs"
                            style={{ width: "48px" }}
                          >
                            {(page - 1) * LIMIT + idx + 1}
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3.5" style={{ minWidth: "180px" }}>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: "var(--accent)" }}
                              >
                                {c.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="min-w-0">
                                <div className="text-t1 font-semibold text-sm truncate">{c.name}</div>
                                <div className="text-t3 text-xs">@{c.username}</div>
                              </div>
                            </div>
                          </td>

                          {/* Address — hidden on mobile */}
                          <td
                            className="hidden md:table-cell px-4 py-3.5 text-t2 text-xs max-w-[160px] truncate"
                          >
                            {c.address?.replace("\n", ", ") || "—"}
                          </td>

                          {/* Email — hidden on tablet */}
                          <td className="hidden lg:table-cell px-4 py-3.5 text-t2 text-xs truncate max-w-[200px]">
                            {c.email}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={
                                c.active
                                  ? { background: "rgba(16,185,129,0.12)", color: "var(--green)" }
                                  : { background: "rgba(139,139,176,0.12)", color: "var(--text3)" }
                              }
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: c.active ? "var(--green)" : "var(--text3)" }}
                              />
                              {c.active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Tier */}
                          <td className="px-4 py-3.5">
                            {tierList.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {tierList.map((t) => <TierPill key={t.id} tier={t.tier} />)}
                              </div>
                            ) : <span className="text-t3">—</span>}
                          </td>

                          {/* Accounts */}
                          <td
                            className="px-4 py-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex flex-wrap gap-1.5">
                              {(c.accounts || []).map((accId) => (
                                <button
                                  key={accId}
                                  onClick={() => setSelectedAccount(accId)}
                                  className="text-xs font-semibold font-mono px-2 py-0.5 rounded transition-all duration-150"
                                  style={{
                                    background: "var(--acc2)",
                                    color: "var(--accent)",
                                    border: "1px solid rgba(233,69,96,0.2)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "var(--accent)";
                                    e.currentTarget.style.color = "#fff";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "var(--acc2)";
                                    e.currentTarget.style.color = "var(--accent)";
                                  }}
                                >
                                  #{accId}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded benefits row */}
                        {isExpanded && tierList.length > 0 && (
                          <tr key={`${c._id}-exp`} style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                            <td colSpan="7" className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span
                                  className="text-xs font-bold uppercase tracking-widest"
                                  style={{ color: "var(--text3)" }}
                                >
                                  Tier Benefits
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {tierList.map((t) => {
                                  const color = TIER_COLORS[t.tier] || "#8b8bb0";
                                  return (
                                    <div
                                      key={t.id}
                                      className="rounded-r2 p-4 flex-1 min-w-[200px]"
                                      style={{
                                        border: `1px solid ${color}44`,
                                        background: color + "0e",
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-sm" style={{ color }}>{t.tier}</span>
                                        <span
                                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                          style={
                                            t.active
                                              ? { color: "var(--green)", background: "rgba(16,185,129,0.1)" }
                                              : { color: "var(--text3)", background: "var(--bg4)" }
                                          }
                                        >
                                          {t.active ? "● Active" : "○ Inactive"}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {(t.benefits || []).map((b, i) => (
                                          <span
                                            key={i}
                                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                                            style={{ background: color + "18", color }}
                                          >
                                            ✓ {b}
                                          </span>
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              className="flex items-center justify-center gap-1 px-5 py-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <PgBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1}>← Prev</PgBtn>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="px-2 text-t3">…</span>
                  ) : (
                    <PgBtn key={p} active={page === p} onClick={() => setPage(p)}>
                      {p}
                    </PgBtn>
                  )
                )}

              <PgBtn onClick={() => setPage((p) => p + 1)} disabled={page === pagination.totalPages}>Next →</PgBtn>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedAccount !== null && (
        <TransactionModal accountId={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </div>
  );
}

function PgBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="min-w-[36px] h-9 px-3 rounded-r text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style={
        active
          ? { background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" }
          : {
              background: "var(--bg3)",
              color: "var(--text2)",
              border: "1px solid var(--border2)",
            }
      }
    >
      {children}
    </button>
  );
}
