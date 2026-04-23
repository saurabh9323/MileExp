/* ─── CustomersView ──────────────────────────────────────
   Customer table page: search + filter bar, table, pagination.
   No stat tiles — those live in DashboardView.

   Props:
     customers       – current page of customer docs
     pagination      – { total, page, totalPages }
     loading         – bool
     error           – string
     search          – string
     activeFilter    – "all" | "true" | "false"
     page            – current page number
     expandedRow     – _id of expanded row or null
     onSearch        – fn(e)
     onFilter        – fn(val)
     onPageChange    – fn(newPage)
     onToggleRow     – fn(id)
     onSelectAccount – fn(accountId)
─────────────────────────────────────────────────────── */
import { IconSearch, IconChevron } from "../icons/index.jsx";
import TierPill from "../TierPill";

const TIER_COLORS = {
  Gold:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.30)"  },
  Silver:   { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.30)" },
  Bronze:   { color: "#b45309", bg: "rgba(180,83,9,0.12)",    border: "rgba(180,83,9,0.30)"    },
  Platinum: { color: "#818cf8", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.30)"  },
};

export default function CustomersView({
  customers,
  pagination,
  loading,
  error,
  search,
  activeFilter,
  page,
  expandedRow,
  onSearch,
  onFilter,
  onPageChange,
  onToggleRow,
  onSelectAccount,
}) {
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Page header ── */}
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Customers
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text3)" }}>
          Browse, search, and inspect all customer records
        </p>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--bg2)", border: "1px solid var(--border2)",
          borderRadius: "10px", padding: "8px 14px", flex: "1", minWidth: "200px",
        }}>
          <span style={{ color: "var(--text3)", flexShrink: 0 }}><IconSearch /></span>
          <input
            value={search}
            onChange={onSearch}
            placeholder="Search by name, email, username…"
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "var(--text)", fontSize: "13px", width: "100%",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {[["all", "All"], ["true", "Active"], ["false", "Inactive"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => onFilter(val)}
              style={{
                padding: "8px 14px", borderRadius: "10px", border: "1px solid",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
                background:  activeFilter === val ? "var(--accent)" : "var(--bg2)",
                color:       activeFilter === val ? "#fff"          : "var(--text2)",
                borderColor: activeFilter === val ? "var(--accent)" : "var(--border2)",
                transition: "all 0.15s",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border2)",
        borderRadius: "16px", overflow: "hidden",
      }}>
        {error && (
          <div style={{
            padding: "20px 24px", color: "var(--red)", fontSize: "13px",
            background: "rgba(244,63,94,0.07)", borderBottom: "1px solid var(--border)",
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border2)" }}>
                {["", "Customer", "Email", "Status", "Tier", "Accounts"].map((th) => (
                  <th key={th} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.9px", color: "var(--text3)", whiteSpace: "nowrap",
                  }}>
                    {th}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "32px", height: "32px",
                        border: "3px solid var(--accent2)", borderTopColor: "var(--accent)",
                        borderRadius: "50%", animation: "spin 0.75s linear infinite",
                      }} />
                      <span style={{ fontSize: "13px", color: "var(--text3)" }}>Loading customers…</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
                    No customers found.
                  </td>
                </tr>
              ) : customers.map((c) => {
                const tierList   = Object.values(c.tier_and_details || {});
                const isExpanded = expandedRow === c._id;

                return (
                  <>
                    <tr
                      key={c._id}
                      onClick={() => onToggleRow(c._id)}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        background: isExpanded ? "var(--bg3)" : "transparent",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "var(--bg3)"; }}
                      onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Expand chevron */}
                      <td style={{ width: "40px", padding: "14px 8px 14px 16px" }}>
                        <span style={{
                          color: "var(--text3)", display: "block",
                          transition: "transform 0.2s",
                          transform: isExpanded ? "rotate(90deg)" : "",
                        }}>
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
                          <span style={{
                            width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                            background: c.active ? "var(--green)" : "var(--text3)",
                          }} />
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Tier */}
                      <td style={{ padding: "14px 16px" }}>
                        {tierList.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {tierList.map((t) => <TierPill key={t.id} tier={t.tier} />)}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text3)" }}>—</span>
                        )}
                      </td>

                      {/* Accounts */}
                      <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {(c.accounts || []).map((accId) => (
                            <button
                              key={accId}
                              onClick={() => onSelectAccount(accId)}
                              style={{
                                fontSize: "11px", fontWeight: 700, fontFamily: "monospace",
                                padding: "3px 8px", borderRadius: "7px", cursor: "pointer",
                                background: "var(--acc2)", color: "var(--accent)",
                                border: "1px solid rgba(233,69,96,0.2)", transition: "all 0.12s",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--acc2)";   e.currentTarget.style.color = "var(--accent)"; }}
                            >
                              #{accId}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded tier benefits row */}
                    {isExpanded && tierList.length > 0 && (
                      <ExpandedBenefitsRow key={`${c._id}-exp`} tierList={tierList} />
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "4px", padding: "14px", borderTop: "1px solid var(--border)",
          }}>
            <PgBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>← Prev</PgBtn>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} style={{ padding: "0 6px", color: "var(--text3)", fontSize: "12px" }}>…</span>
                ) : (
                  <PgBtn key={p} active={page === p} onClick={() => onPageChange(p)}>{p}</PgBtn>
                )
              )}

            <PgBtn onClick={() => onPageChange(page + 1)} disabled={page === pagination.totalPages}>Next →</PgBtn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Expanded tier benefits row ── */
function ExpandedBenefitsRow({ tierList }) {
  return (
    <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
      <td colSpan="6" style={{ padding: "16px 24px" }}>
        <div style={{
          fontSize: "10px", fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.9px", color: "var(--text3)", marginBottom: "12px",
        }}>
          Tier Benefits
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {tierList.map((t) => {
            const c = TIER_COLORS[t.tier] || { color: "#8b8bb0", bg: "rgba(139,139,176,0.1)", border: "rgba(139,139,176,0.3)" };
            return (
              <div key={t.id} style={{
                borderRadius: "12px", padding: "14px 16px",
                minWidth: "200px", flex: "1",
                background: c.bg, border: `1px solid ${c.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontWeight: 800, fontSize: "13px", color: c.color }}>{t.tier}</span>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                    background: t.active ? "rgba(16,185,129,0.1)" : "var(--bg4)",
                    color: t.active ? "var(--green)" : "var(--text3)",
                  }}>
                    {t.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {(t.benefits || []).map((b, i) => (
                    <span key={i} style={{
                      fontSize: "11px", padding: "3px 8px", borderRadius: "6px",
                      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                    }}>
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
  );
}

/* ── Pagination button ── */
function PgBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: "36px", height: "36px", padding: "0 12px",
        borderRadius: "8px", fontSize: "12px", fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        background: active ? "var(--accent)" : "var(--bg3)",
        color:      active ? "#fff"          : "var(--text2)",
        border:     active ? "1px solid var(--accent)" : "1px solid var(--border2)",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
