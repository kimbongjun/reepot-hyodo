import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: "#DAC8B5",
        sky: "#EDE4DA",
        black: "#393D42"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(57, 61, 66, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
