import { useAuth } from "../context/AuthContext";

const TIER_COLORS = {
  Gold:     { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", border: "rgba(245,158,11,0.30)"  },
  Silver:   { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "rgba(148,163,184,0.30)" },
  Bronze:   { bg: "rgba(180,83,9,0.12)",    color: "#b45309", border: "rgba(180,83,9,0.30)"    },
  Platinum: { bg: "rgba(99,102,241,0.12)",  color: "#818cf8", border: "rgba(99,102,241,0.30)"  },
};

const fmtDate = (s) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

export default function UserProfile({ customer, onClose }) {
  const { user, tokenPayload, signOut } = useAuth();

  const tierEntries = customer?.tier_and_details
    ? Object.values(customer.tier_and_details)
    : [];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Profile box */}
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: "560px",
          maxHeight: "90vh",
          background: "var(--bg2)",
          border: "1px solid var(--border2)",
          borderRadius: "20px",
          boxShadow: "0 0 0 1px var(--border), 0 48px 120px rgba(0,0,0,0.5)",
          animation: "slideUp 0.25s cubic-bezier(.22,1,.36,1)",
        }}
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            className="text-t1 font-extrabold tracking-tight"
            style={{ fontSize: "20px", letterSpacing: "-0.4px" }}
          >
            User Profile
          </h2>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-r text-sm flex-shrink-0 transition-all duration-150"
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              color: "var(--text2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "var(--accent3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text2)";
              e.currentTarget.style.background = "var(--bg3)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* ── Avatar + basic info ── */}
          <Section>
            <div className="flex items-center gap-4">
              <img
                src={
                  user?.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "U")}&background=e94560&color=fff&size=96`
                }
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                style={{ border: "3px solid var(--accent)" }}
              />
              <div className="min-w-0">
                <div className="text-t1 font-extrabold text-lg tracking-tight truncate">
                  {user?.displayName || "User"}
                </div>
                <div className="text-t2 text-sm truncate">{user?.email}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ background: "var(--bg4)", color: "var(--text3)" }}
                  >
                    UID
                  </span>
                  <code
                    className="text-xs font-mono truncate"
                    style={{ color: "var(--text3)" }}
                  >
                    {user?.uid?.slice(0, 20)}…
                  </code>
                </div>
              </div>
            </div>
          </Section>

          {/* ── JWT / Personal info ── */}
          {tokenPayload && (
            <Section title="Personal Info">
              <InfoGrid
                rows={[
                  ["Name",     tokenPayload.name || user?.displayName || "—"],
                  ["Email",    tokenPayload.email || "—"],
                  ["UID",      tokenPayload.user_id || tokenPayload.sub || "—"],
                  ["Provider", tokenPayload.firebase?.sign_in_provider || "—"],
                  ["Audience", tokenPayload.aud || "—"],
                ]}
              />
            </Section>
          )}

          {/* ── Customer record ── */}
          {customer && (
            <>
              <Section title="Customer Record">
                <InfoGrid
                  rows={[
                    ["Username", `@${customer.username}`],
                    ["Address",  customer.address || "—"],
                    ["Birthdate",fmtDate(customer.birthdate)],
                    ["Status",   customer.active ? "Active" : "Inactive", customer.active ? "green" : "muted"],
                    ["Accounts", `${(customer.accounts || []).length} linked`],
                  ]}
                />
              </Section>

              {/* Linked Accounts */}
              {(customer.accounts || []).length > 0 && (
                <Section title="Linked Accounts">
                  <div className="flex flex-wrap gap-2">
                    {customer.accounts.map((id) => (
                      <span
                        key={id}
                        className="text-xs font-bold font-mono px-2.5 py-1 rounded"
                        style={{
                          background: "var(--acc2)",
                          color: "var(--accent)",
                          border: "1px solid rgba(233,69,96,0.2)",
                        }}
                      >
                        #{id}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Tier & Benefits */}
              {tierEntries.length > 0 && (
                <Section title="Tier & Benefits">
                  <div className="flex flex-col gap-3">
                    {tierEntries.map((t) => {
                      const colors = TIER_COLORS[t.tier] || TIER_COLORS.Gold;
                      return (
                        <div
                          key={t.id}
                          className="rounded-r2 p-4"
                          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-extrabold text-sm" style={{ color: colors.color }}>
                              {t.tier === "Gold" ? "★" : t.tier === "Platinum" ? "◆" : "●"} {t.tier}
                            </span>
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={
                                t.active
                                  ? { color: "var(--green)", background: "rgba(16,185,129,0.1)" }
                                  : { color: "var(--text3)", background: "var(--bg4)" }
                              }
                            >
                              {t.active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-2 mb-3">
                            {(t.benefits || []).map((b, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-sm text-t1">
                                <span className="font-bold flex-shrink-0" style={{ color: colors.color }}>✓</span>
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>

                          <div
                            className="font-mono text-xs text-t3 pt-3"
                            style={{ borderTop: "1px solid var(--border)" }}
                          >
                            ID: {t.id}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* ── Sign Out ── */}
          <Section>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-r text-sm font-semibold transition-all duration-150"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "var(--red)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(244,63,94,0.15)";
                e.currentTarget.style.borderColor = "var(--red)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(244,63,94,0.08)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Section({ title, children }) {
  return (
    <div
      className="px-6 py-5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {title && (
        <div
          className="text-xs font-bold uppercase tracking-widest mb-3.5"
          style={{ color: "var(--text3)" }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function InfoGrid({ rows }) {
  return (
    <div
      className="rounded-r overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      {rows.map(([key, val, variant], i) => (
        <div
          key={key}
          className="flex items-start gap-3 px-3.5 py-2.5"
          style={{
            borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <span
            className="text-xs font-semibold flex-shrink-0 pt-px"
            style={{ color: "var(--text3)", minWidth: "80px" }}
          >
            {key}
          </span>
          <span
            className="text-xs font-mono break-all"
            style={{
              color:
                variant === "green" ? "var(--green)"
                : variant === "muted" ? "var(--text3)"
                : "var(--text)",
            }}
          >
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}
