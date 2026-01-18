/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        rosey: "#ff6fa3",
        peachy: "#ffb77a",
        glass: "rgba(255,255,255,0.6)",
        "card-1": "#fff7fb"
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
      },
      boxShadow: {
        "soft-lg": "0 12px 30px rgba(12,12,20,0.12)",
        "glass": "0 8px 30px rgba(255,112,160,0.08)",
      },
      keyframes: {
        floaty: { "0%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-14px)" }, "100%": { transform: "translateY(0px)" } },
        pop: { "0%": { transform: "scale(0.9)" }, "60%": { transform: "scale(1.08)" }, "100%": { transform: "scale(1)" } }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        pop: "pop .45s ease"
      },
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.19, 1, 0.22, 1)'
      }
    },
  },
  plugins: [],
};
