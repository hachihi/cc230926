import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2321",
        paper: "#F6F5F1",
        brand: "#2F5D50",
        brandDark: "#1E3F36",
        accent: "#C46A2E",
        line: "#DEDBD2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Fraunces'", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
