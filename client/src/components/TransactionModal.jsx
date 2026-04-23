import { useEffect, useRef, useState } from "react";
import { getTransactionsByAccount } from "../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtDate = (s) =>
  new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function TransactionModal({ accountId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTransactionsByAccount(accountId);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accountId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (ref.current && !ref.current.contains(e.target)) onClose();
  };

  const txns = data?.transactions || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdrop}
    >
      <div
        ref={ref}
        className="w-full flex flex-col"
        style={{
          maxWidth: "920px", maxHeight: "88vh",
          background: "var(--bg2)", border: "1px solid var(--border2)",
          borderRadius: "20px",
          boxShadow: "0 0 0 1px var(--border), 0 48px 120px rgba(0,0,0,0.5)",
          animation: "slideUp 0.25s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full"
                style={{ background: "var(--acc2)", color: "var(--accent)", border: "1px solid rgba(233,69,96,0.25)" }}>
                Account #{accountId}
              </span>
              {data && <span className="text-xs font-medium" style={{ color: "var(--text2)" }}>{txns.length} transactions</span>}
            </div>
            <h2 className="font-extrabold tracking-tight" style={{ fontSize: "22px", letterSpacing: "-0.4px", color: "var(--text)" }}>
              Transaction History
            </h2>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded text-sm font-semibold flex-shrink-0 transition-all duration-150 ml-4"
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text2)"; }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16" style={{ color: "var(--text2)" }}>
              <div className="w-8 h-8 rounded-full flex-shrink-0" style={{
                border: "3px solid var(--accent2)", borderTopColor: "var(--accent)",
                animation: "spin 0.75s linear infinite",
              }} />
              <span className="text-sm">Fetching transactions…</span>
            </div>
          )}
          {error && <div className="px-7 py-5 text-sm" style={{ color: "var(--red)" }}>Error: {error}</div>}
          {!loading && !error && txns.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16">
              <span className="text-3xl">📭</span>
              <span className="text-sm" style={{ color: "var(--text3)" }}>No transactions found for this account.</span>
            </div>
          )}

          {!loading && txns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse", minWidth: "560px" }}>
                <thead>
                  <tr className="sticky top-0 z-10" style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border2)" }}>
                    {["#", "Date", "Type", "Symbol", "Amount", "Total Value"].map((th) => (
                      <th key={th} className="px-4 py-3 text-left font-bold uppercase whitespace-nowrap"
                        style={{ fontSize: "10.5px", letterSpacing: "0.9px", color: "var(--text3)" }}>{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((tx, i) => {
                    const isFlagged = tx.amount < 5000;
                    return (
                      <tr key={i}
                        style={{ borderBottom: "1px solid var(--border)", background: isFlagged ? "rgba(244,63,94,0.04)" : "transparent" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isFlagged ? "rgba(244,63,94,0.07)" : "var(--bg3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isFlagged ? "rgba(244,63,94,0.04)" : "transparent"; }}>
                        <td className="px-4 py-3.5 font-mono text-xs" style={{ width: "48px", color: "var(--text3)" }}>{i + 1}</td>
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--text2)" }}>{fmtDate(tx.date)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide font-mono txn-${tx.transaction_code}`}>
                            {tx.transaction_code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-xs tracking-wide" style={{ color: "var(--gold)" }}>
                          {tx.symbol?.toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs">
                          <span style={{ color: isFlagged ? "var(--red)" : "var(--text)", fontWeight: isFlagged ? 700 : 500 }}>
                            {fmt(tx.amount)}
                          </span>
                          {isFlagged && <span className="ml-1.5 text-xs opacity-80" title="Below $5,000" style={{ color: "var(--red)" }}>⚑</span>}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs" style={{ color: "var(--text2)" }}>
                          {parseFloat(tx.total).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && txns.length > 0 && (
          <div className="flex items-center justify-between px-7 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text3)" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--red)", boxShadow: "0 0 6px var(--red)" }} />
              Transactions below $5,000 are flagged
            </div>
            <button onClick={onClose}
              className="px-5 py-2.5 text-white text-sm font-bold rounded transition-all duration-150"
              style={{ background: "var(--accent)", border: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#c73050"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}