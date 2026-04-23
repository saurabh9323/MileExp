/* ─── AlertsView ─────────────────────────────────────────
   Flagged customers and system notifications.
   Props: customers
─────────────────────────────────────────────────────── */
export default function AlertsView({ customers }) {
  const noActiveTier = customers.filter((c) => {
    const tiers = Object.values(c.tier_and_details || {});
    return !tiers.some((t) => t.active);
  });

  return (
    <div style={{ padding: "28px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
        Alerts
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "24px" }}>
        Flagged customers and system notifications
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* Low transaction banner */}
        <div style={{
          background: "rgba(244,63,94,0.08)",
          border: "1px solid rgba(244,63,94,0.25)",
          borderRadius: "14px", padding: "16px 20px",
          display: "flex", gap: "14px", alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "20px", flexShrink: 0 }}>⚑</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--red)", marginBottom: "4px" }}>
              Low-Amount Transaction Monitor
            </div>
            <div style={{ fontSize: "13px", color: "var(--text2)" }}>
              Transactions below $5,000 are flagged in red in the Transaction History modal.
              Click any account ID in the Customers view to inspect.
            </div>
          </div>
        </div>

        {/* Customers without active tier */}
        {noActiveTier.length > 0 ? (
          <div style={{
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "14px", padding: "16px 20px",
          }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#f59e0b", marginBottom: "10px" }}>
              ⚠ Customers Without Active Tier ({noActiveTier.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {noActiveTier.slice(0, 20).map((c) => (
                <span key={c._id} style={{
                  fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "8px",
                  background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}>
                  @{c.username}
                </span>
              ))}
              {noActiveTier.length > 20 && (
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>
                  +{noActiveTier.length - 20} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "14px", padding: "16px 20px",
            display: "flex", gap: "12px", alignItems: "center",
          }}>
            <span style={{ fontSize: "20px" }}>✅</span>
            <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>
              All customers on this page have at least one active tier.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
