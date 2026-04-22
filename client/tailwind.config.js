/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "var(--bg)",
        bg2:       "var(--bg2)",
        bg3:       "var(--bg3)",
        bg4:       "var(--bg4)",
        bg5:       "var(--bg5)",
        accent:    "var(--accent)",
        "acc2":    "var(--accent2)",
        "acc3":    "var(--accent3)",
        t1:        "var(--text)",
        t2:        "var(--text2)",
        t3:        "var(--text3)",
        bdr:       "var(--border)",
        bdr2:      "var(--border2)",
        bdr3:      "var(--border3)",
        gold:      "var(--gold)",
        "clr-green": "var(--green)",
        "clr-red":   "var(--red)",
        "clr-blue":  "var(--blue)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        r:  "var(--r)",
        r2: "var(--r2)",
        r3: "var(--r3)",
      },
      boxShadow: {
        card:  "var(--shadow)",
        card2: "var(--shadow2)",
      },
      animation: {
        "fade-up":  "fadeUp 0.5s cubic-bezier(.22,1,.36,1)",
        "slide-up": "slideUp 0.25s cubic-bezier(.22,1,.36,1)",
        "spin-slow": "spin 0.75s linear infinite",
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: "translateY(28px)" }, to: { opacity: 1, transform: "none" } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px) scale(0.97)" }, to: { opacity: 1, transform: "none" } },
      },
    },
  },
  plugins: [],
};
