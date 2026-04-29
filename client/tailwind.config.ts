import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f6fb",
          100: "#ddeaf5",
          200: "#c1d6eb",
          300: "#9fbae0",
          400: "#7d9cd4",
          500: "#5b7fc8",
          600: "#427AB5",
          700: "#406AAF",
          800: "#315589",
          900: "#264463",
        },
        accent: {
          50: "#fffef5",
          100: "#fffce8",
          200: "#fff9d1",
          300: "#fff5b3",
          400: "#ffee95",
          500: "#ffe8be",
          600: "#F7DD7D",
          700: "#f5d855",
          800: "#e6c429",
          900: "#c9a81a",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
