import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#f7fbff",
        brand: "#2d3b64",
        sky: "#8dd7f7",
        mist: "#dff4ff"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(45, 59, 100, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
