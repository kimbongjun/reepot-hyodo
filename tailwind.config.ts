import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#2d3b64",
        sky: "#8dd7f7"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(45, 59, 100, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
