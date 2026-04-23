/* ─── DonutChart ─────────────────────────────────────────
   SVG donut chart. Props: segments [{ label, value, color }], size
─────────────────────────────────────────────────────── */
export default function DonutChart({ segments, size = 120 }) {
  const r = 42, cx = 60, cy = 60;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg3)" strokeWidth="16" />

      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
          />
        );
        offset += dash;
        return el;
      })}

      {/* Centre labels */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--text)">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--text3)">
        Total
      </text>
    </svg>
  );
}
