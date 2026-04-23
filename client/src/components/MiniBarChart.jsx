/* ─── MiniBarChart ───────────────────────────────────────
   SVG bar chart. Props: data [{ label, value }], color
─────────────────────────────────────────────────────── */
export default function MiniBarChart({ data, color = "var(--accent)" }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));
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
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} opacity="0.75" />
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize="9" fill="var(--text3)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
